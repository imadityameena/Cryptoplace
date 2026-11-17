import * as coingecko from "../services/coingecko.service.js";
import ApiError from "../utils/ApiError.js";
import { SUPPORTED_CURRENCIES } from "../utils/constants.js";
import { resolveCurrency as parseCurrency } from "../utils/currency.js";

const parseIntInRange = (value, fallback, min, max) => {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

export const listCoins = async (req, res) => {
  const currency = parseCurrency(req.query.vs_currency);
  const page = parseIntInRange(req.query.page, 1, 1, 100);
  const perPage = parseIntInRange(req.query.per_page, 100, 1, 250);

  const coins = await coingecko.getMarkets({
    currency,
    page,
    perPage,
    order: "market_cap_desc",
  });

  res.json({ success: true, currency, page, perPage, data: coins });
};

export const getCoin = async (req, res) => {
  const coin = await coingecko.getCoin(req.params.id);
  res.json({ success: true, data: coin });
};

export const getCoinChart = async (req, res) => {
  const currency = parseCurrency(req.query.vs_currency);
  const days = parseIntInRange(req.query.days, 10, 1, 365);

  const chart = await coingecko.getMarketChart({
    id: req.params.id,
    currency,
    days,
  });

  res.json({ success: true, currency, days, data: chart });
};

export const search = async (req, res) => {
  const query = (req.query.q || "").trim();
  if (!query) throw ApiError.badRequest("Query parameter 'q' is required");

  const result = await coingecko.searchCoins(query);
  res.json({ success: true, data: result.coins || [] });
};

export const trending = async (req, res) => {
  const result = await coingecko.getTrending();
  res.json({
    success: true,
    data: (result.coins || []).map((c) => c.item),
  });
};

export const currencies = (req, res) => {
  res.json({ success: true, data: SUPPORTED_CURRENCIES });
};
