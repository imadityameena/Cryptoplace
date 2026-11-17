import WatchlistItem from "../models/WatchlistItem.js";
import * as coingecko from "../services/coingecko.service.js";
import ApiError from "../utils/ApiError.js";
import { resolveCurrency } from "../utils/currency.js";

export const getWatchlist = async (req, res) => {
  const currency = resolveCurrency(req.query.vs_currency, req.user.preferredCurrency);
  const items = await WatchlistItem.find({ user: req.user._id }).sort({ createdAt: -1 });

  if (!items.length) {
    return res.json({ success: true, currency, data: [] });
  }

  const ids = items.map((item) => item.coinId);
  const markets = await coingecko.getMarkets({
    currency,
    ids: ids.join(","),
    perPage: 250,
    page: 1,
  });
  const marketById = new Map(markets.map((coin) => [coin.id, coin]));

  const data = items.map((item) => ({
    coinId: item.coinId,
    addedAt: item.createdAt,
    market: marketById.get(item.coinId) || null,
  }));

  res.json({ success: true, currency, data });
};

export const addToWatchlist = async (req, res) => {
  const { coinId } = req.body;
  await coingecko.assertCoinExists(coinId);

  try {
    const item = await WatchlistItem.create({ user: req.user._id, coinId });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err.code === 11000) throw ApiError.conflict("Coin is already in your watchlist");
    throw err;
  }
};

export const removeFromWatchlist = async (req, res) => {
  const result = await WatchlistItem.deleteOne({
    user: req.user._id,
    coinId: req.params.coinId,
  });

  if (!result.deletedCount) throw ApiError.notFound("Coin is not in your watchlist");
  res.status(204).end();
};

export const clearWatchlist = async (req, res) => {
  await WatchlistItem.deleteMany({ user: req.user._id });
  res.status(204).end();
};
