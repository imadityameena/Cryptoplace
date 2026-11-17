import { matchedData } from "express-validator";
import Transaction from "../models/Transaction.js";
import * as coingecko from "../services/coingecko.service.js";
import { assertNoOversell, buildHoldings, summarize } from "../services/portfolio.service.js";
import ApiError from "../utils/ApiError.js";
import { resolveCurrency } from "../utils/currency.js";

const EDITABLE_FIELDS = ["type", "quantity", "pricePerCoin", "fee", "currency", "date", "note"];

export const getPortfolio = async (req, res) => {
  const currency = resolveCurrency(req.query.vs_currency, req.user.preferredCurrency);
  const transactions = await Transaction.find({ user: req.user._id }).lean();

  if (!transactions.length) {
    return res.json({
      success: true,
      currency,
      data: summarize([], new Map()),
    });
  }

  const currencies = [...new Set([currency, ...transactions.map((t) => t.currency)])];
  const rate = currencies.length > 1 ? await coingecko.getExchangeRates(currencies) : () => 1;
  const convert = (amount, from) => amount * rate(from, currency);

  const holdings = buildHoldings(transactions, convert);
  const openIds = holdings.filter((h) => h.quantity > 0).map((h) => h.coinId);

  const markets = openIds.length
    ? await coingecko.getMarkets({ currency, ids: openIds.join(","), perPage: 250, page: 1 })
    : [];
  const marketById = new Map(markets.map((m) => [m.id, m]));

  res.json({ success: true, currency, data: summarize(holdings, marketById) });
};

export const listTransactions = async (req, res) => {
  const { page = 1, limit = 20, coinId } = matchedData(req, { locations: ["query"] });
  const filter = { user: req.user._id };
  if (coinId) filter.coinId = coinId;

  const [items, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Transaction.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const getTransaction = async (req, res) => {
  const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
  if (!tx) throw ApiError.notFound("Transaction not found");
  res.json({ success: true, data: tx });
};

const coinTransactions = (userId, coinId) =>
  Transaction.find({ user: userId, coinId }).lean();

export const createTransaction = async (req, res) => {
  const { coinId } = req.body;
  await coingecko.assertCoinExists(coinId);

  const draft = {
    user: req.user._id,
    coinId,
    currency: req.body.currency || req.user.preferredCurrency,
    date: req.body.date ? new Date(req.body.date) : new Date(),
    createdAt: new Date(),
  };
  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined && draft[field] === undefined) draft[field] = req.body[field];
  }

  const existing = await coinTransactions(req.user._id, coinId);
  assertNoOversell([...existing, draft]);

  const tx = await Transaction.create(draft);
  res.status(201).json({ success: true, data: tx });
};

export const updateTransaction = async (req, res) => {
  const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
  if (!tx) throw ApiError.notFound("Transaction not found");

  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) {
      tx[field] = field === "date" ? new Date(req.body[field]) : req.body[field];
    }
  }

  const others = (await coinTransactions(req.user._id, tx.coinId)).filter(
    (t) => !t._id.equals(tx._id)
  );
  assertNoOversell([...others, tx.toObject()]);

  await tx.save();
  res.json({ success: true, data: tx });
};

export const deleteTransaction = async (req, res) => {
  const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
  if (!tx) throw ApiError.notFound("Transaction not found");

  const remaining = (await coinTransactions(req.user._id, tx.coinId)).filter(
    (t) => !t._id.equals(tx._id)
  );
  assertNoOversell(remaining);

  await tx.deleteOne();
  res.status(204).end();
};
