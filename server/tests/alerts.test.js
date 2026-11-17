import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import supertest from "supertest";
import { app, start, stop, resetDb, createUser } from "./setup.js";
import { checkAlerts } from "../src/services/alertChecker.service.js";

const request = supertest(app);

describe("Alerts", () => {
  let auth;
  const create = (body) => request.post("/api/alerts").set(auth).send(body);

  before(start);
  after(stop);
  beforeEach(async () => {
    await resetDb();
    const { token } = await createUser(request);
    auth = { Authorization: `Bearer ${token}` };
  });

  it("validates alert input", async () => {
    const res = await create({ coinId: "bitcoin", condition: "maybe", targetPrice: 0 }).expect(400);
    assert.equal(res.body.details.length, 2);
  });

  it("triggers only alerts whose condition is met", async () => {
    await create({ coinId: "bitcoin", condition: "above", targetPrice: 55000 }).expect(201);
    await create({ coinId: "bitcoin", condition: "below", targetPrice: 55000 }).expect(201);
    await create({ coinId: "bitcoin", condition: "below", targetPrice: 55000, currency: "eur" }).expect(201);

    const triggered = await checkAlerts();
    assert.equal(triggered, 2);

    const res = await request.get("/api/alerts?status=triggered").set(auth).expect(200);
    const prices = res.body.data.map((a) => a.triggeredPrice).sort();
    assert.deepEqual(prices, [50000, 60000]);
  });

  it("re-arms a triggered alert when its target changes", async () => {
    const { body } = await create({ coinId: "bitcoin", condition: "above", targetPrice: 1 });
    await checkAlerts();

    const res = await request
      .patch(`/api/alerts/${body.data.id}`)
      .set(auth)
      .send({ targetPrice: 100000 })
      .expect(200);
    assert.equal(res.body.data.status, "active");
    assert.equal(res.body.data.triggeredPrice, undefined);
  });
});
