import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import supertest from "supertest";
import { app, start, stop, resetDb, createUser } from "./setup.js";
import { buildHoldings } from "../src/services/portfolio.service.js";

const request = supertest(app);

describe("Portfolio calculations", () => {
  it("uses average cost for realized profit", () => {
    const tx = (type, quantity, pricePerCoin, date, fee = 0) => ({
      coinId: "bitcoin",
      type,
      quantity,
      pricePerCoin,
      fee,
      currency: "usd",
      date: new Date(date),
    });

    const [h] = buildHoldings(
      [
        tx("buy", 1, 100, "2025-01-01"),
        tx("buy", 1, 200, "2025-01-02"),
        tx("sell", 1, 300, "2025-01-03", 5),
      ],
      (amount) => amount
    );

    assert.equal(h.quantity, 1);
    assert.equal(h.costBasis, 150);
    assert.equal(h.realizedPnl, 145);
  });
});

describe("Portfolio API", () => {
  let auth;
  const tx = (body) => request.post("/api/portfolio/transactions").set(auth).send(body);

  before(start);
  after(stop);
  beforeEach(async () => {
    await resetDb();
    const { token } = await createUser(request);
    auth = { Authorization: `Bearer ${token}` };
  });

  it("summarizes holdings with unrealized profit", async () => {
    await tx({ coinId: "bitcoin", type: "buy", quantity: 2, pricePerCoin: 50000 }).expect(201);

    const res = await request.get("/api/portfolio").set(auth).expect(200);
    const { totals, holdings } = res.body.data;
    assert.equal(totals.value, 120000);
    assert.equal(totals.costBasis, 100000);
    assert.equal(totals.unrealizedPnl, 20000);
    assert.equal(holdings[0].allocationPercent, 100);
  });

  it("converts transactions recorded in other currencies", async () => {
    await tx({
      coinId: "ethereum",
      type: "buy",
      quantity: 1,
      pricePerCoin: 2500,
      currency: "eur",
    }).expect(201);

    const res = await request.get("/api/portfolio?vs_currency=usd").set(auth).expect(200);
    // 2500 EUR at the BTC-implied rate of 60000/50000
    assert.equal(res.body.data.holdings[0].costBasis, 3000);
  });

  it("prevents selling more than held", async () => {
    await tx({ coinId: "bitcoin", type: "buy", quantity: 1, pricePerCoin: 1, date: "2025-02-01" });
    await tx({ coinId: "bitcoin", type: "sell", quantity: 2, pricePerCoin: 1 }).expect(400);
    await tx({
      coinId: "bitcoin",
      type: "sell",
      quantity: 1,
      pricePerCoin: 1,
      date: "2025-01-01",
    }).expect(400);
  });

  it("blocks deleting a buy that a later sell depends on", async () => {
    const buy = await tx({ coinId: "bitcoin", type: "buy", quantity: 1, pricePerCoin: 1, date: "2025-01-01" });
    await tx({ coinId: "bitcoin", type: "sell", quantity: 1, pricePerCoin: 2, date: "2025-01-02" });

    await request.delete(`/api/portfolio/transactions/${buy.body.data.id}`).set(auth).expect(400);
  });

  it("paginates transactions", async () => {
    for (let i = 0; i < 3; i += 1) {
      await tx({ coinId: "bitcoin", type: "buy", quantity: 1, pricePerCoin: 1 });
    }
    const res = await request.get("/api/portfolio/transactions?limit=2&page=2").set(auth).expect(200);
    assert.equal(res.body.data.length, 1);
    assert.deepEqual(res.body.pagination, { page: 2, limit: 2, total: 3, pages: 2 });
  });
});
