import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import supertest from "supertest";
import { app, start, stop, resetDb, createUser } from "./setup.js";

const request = supertest(app);

describe("Watchlist", () => {
  let auth;

  before(start);
  after(stop);
  beforeEach(async () => {
    await resetDb();
    const { token } = await createUser(request);
    auth = { Authorization: `Bearer ${token}` };
  });

  it("adds coins and returns them with market data", async () => {
    await request.post("/api/watchlist").set(auth).send({ coinId: "bitcoin" }).expect(201);
    await request.post("/api/watchlist").set(auth).send({ coinId: "Ethereum" }).expect(201);

    const res = await request.get("/api/watchlist?vs_currency=eur").set(auth).expect(200);
    assert.equal(res.body.currency, "eur");
    assert.equal(res.body.data.length, 2);
    const btc = res.body.data.find((i) => i.coinId === "bitcoin");
    assert.equal(btc.market.current_price, 50000);
  });

  it("rejects duplicates and unknown coins", async () => {
    await request.post("/api/watchlist").set(auth).send({ coinId: "bitcoin" }).expect(201);
    await request.post("/api/watchlist").set(auth).send({ coinId: "bitcoin" }).expect(409);
    await request.post("/api/watchlist").set(auth).send({ coinId: "notacoin" }).expect(404);
  });

  it("removes coins", async () => {
    await request.post("/api/watchlist").set(auth).send({ coinId: "bitcoin" });
    await request.delete("/api/watchlist/bitcoin").set(auth).expect(204);
    await request.delete("/api/watchlist/bitcoin").set(auth).expect(404);
  });

  it("keeps watchlists separate per user", async () => {
    await request.post("/api/watchlist").set(auth).send({ coinId: "bitcoin" });
    const other = await createUser(request);
    const res = await request
      .get("/api/watchlist")
      .set("Authorization", `Bearer ${other.token}`)
      .expect(200);
    assert.equal(res.body.data.length, 0);
  });
});
