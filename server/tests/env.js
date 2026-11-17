import { MongoMemoryServer } from "mongodb-memory-server";

// Loaded with --import so it runs before any application module

export const mongo = await MongoMemoryServer.create();

process.env.NODE_ENV = "test";
process.env.MONGO_URI = mongo.getUri("cryptoplace-test");
process.env.JWT_SECRET = "test-secret";
process.env.COINGECKO_BASE_URL = "https://coingecko.test";

const PRICES = {
  bitcoin: { usd: 60000, eur: 50000, inr: 5000000 },
  ethereum: { usd: 3000, eur: 2500, inr: 250000 },
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

// Stub the market data provider so tests run offline and deterministically
globalThis.fetch = async (input) => {
  const url = new URL(typeof input === "string" ? input : input.url);
  const params = url.searchParams;

  if (url.pathname === "/coins/markets") {
    const currency = params.get("vs_currency");
    const ids = params.get("ids")?.split(",") ?? Object.keys(PRICES);
    return json(
      ids
        .filter((id) => PRICES[id])
        .map((id) => ({
          id,
          name: id[0].toUpperCase() + id.slice(1),
          symbol: id.slice(0, 3),
          current_price: PRICES[id][currency],
          price_change_percentage_24h: 1.5,
        }))
    );
  }

  if (url.pathname === "/simple/price") {
    const currencies = params.get("vs_currencies").split(",");
    const out = {};
    for (const id of params.get("ids").split(",")) {
      if (!PRICES[id]) continue;
      out[id] = Object.fromEntries(currencies.map((c) => [c, PRICES[id][c]]));
    }
    return json(out);
  }

  const coinMatch = url.pathname.match(/^\/coins\/([^/]+)$/);
  if (coinMatch) {
    return PRICES[coinMatch[1]] ? json({ id: coinMatch[1] }) : json({ error: "not found" }, 404);
  }

  return json({ error: "not stubbed" }, 500);
};

