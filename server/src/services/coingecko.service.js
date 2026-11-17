import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import TTLCache from "../utils/cache.js";

const cache = new TTLCache(env.cacheTtlSeconds);
const pending = new Map();

const request = async (path, params = {}, ttlSeconds) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  ).toString();
  const url = `${env.coingeckoBaseUrl}${path}${query ? `?${query}` : ""}`;

  const cached = cache.get(url);
  if (cached) return cached;

  // Share a single upstream request between concurrent callers
  if (pending.has(url)) return pending.get(url);

  const headers = { accept: "application/json" };
  if (env.coingeckoApiKey) headers["x-cg-demo-api-key"] = env.coingeckoApiKey;

  const promise = (async () => {
    let res;
    try {
      res = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
    } catch {
      throw new ApiError(503, "Market data provider is unreachable");
    }

    if (res.status === 404) throw ApiError.notFound("Coin not found");
    if (res.status === 429) {
      throw new ApiError(429, "Market data rate limit reached, try again shortly");
    }
    if (!res.ok) {
      throw new ApiError(502, `Market data provider error (${res.status})`);
    }

    const data = await res.json();
    cache.set(url, data, ttlSeconds);
    return data;
  })();

  pending.set(url, promise);
  try {
    return await promise;
  } finally {
    pending.delete(url);
  }
};

export const getMarkets = ({ currency, page, perPage, ids, order }) =>
  request("/coins/markets", {
    vs_currency: currency,
    page,
    per_page: perPage,
    ids,
    order,
    price_change_percentage: "24h",
  });

export const getCoin = (id) =>
  request(`/coins/${encodeURIComponent(id)}`, {
    localization: false,
    tickers: false,
    community_data: false,
    developer_data: false,
  });

export const getMarketChart = ({ id, currency, days }) =>
  request(
    `/coins/${encodeURIComponent(id)}/market_chart`,
    {
      vs_currency: currency,
      days,
      interval: days > 1 ? "daily" : undefined,
    },
    300
  );

export const getSimplePrice = ({ ids, currencies }) =>
  request("/simple/price", {
    ids: ids.join(","),
    vs_currencies: currencies.join(","),
    include_24hr_change: true,
  });

export const searchCoins = (query) => request("/search", { query }, 600);

export const getTrending = () => request("/search/trending", {}, 600);
