import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import supertest from "supertest";
import { app, start, stop, resetDb } from "./setup.js";

const request = supertest(app);

describe("Auth", () => {
  before(start);
  after(stop);
  beforeEach(resetDb);

  const valid = { name: "Alice", email: "Alice@Example.com", password: "password123" };

  it("registers a user and returns a token", async () => {
    const res = await request.post("/api/auth/register").send(valid).expect(201);
    assert.ok(res.body.token);
    assert.equal(res.body.user.email, "alice@example.com");
    assert.equal(res.body.user.password, undefined);
  });

  it("rejects invalid registration input", async () => {
    const res = await request
      .post("/api/auth/register")
      .send({ name: "", email: "nope", password: "short" })
      .expect(400);
    const fields = res.body.details.map((d) => d.field);
    assert.ok(fields.includes("name"));
    assert.ok(fields.includes("email"));
    assert.ok(fields.includes("password"));
  });

  it("rejects duplicate emails", async () => {
    await request.post("/api/auth/register").send(valid).expect(201);
    await request.post("/api/auth/register").send(valid).expect(409);
  });

  it("logs in with correct credentials only", async () => {
    await request.post("/api/auth/register").send(valid);
    await request
      .post("/api/auth/login")
      .send({ email: valid.email, password: "wrongpass1" })
      .expect(401);
    const res = await request
      .post("/api/auth/login")
      .send({ email: valid.email, password: valid.password })
      .expect(200);
    assert.ok(res.body.token);
  });

  it("protects /me and updates the profile", async () => {
    const { body } = await request.post("/api/auth/register").send(valid);
    await request.get("/api/auth/me").expect(401);
    await request.get("/api/auth/me").set("Authorization", "Bearer garbage").expect(401);

    const res = await request
      .patch("/api/auth/me")
      .set("Authorization", `Bearer ${body.token}`)
      .send({ preferredCurrency: "inr" })
      .expect(200);
    assert.equal(res.body.user.preferredCurrency, "inr");
  });

  it("rejects a wrong current password without ending the session", async () => {
    const { body } = await request.post("/api/auth/register").send(valid);
    await request
      .patch("/api/auth/password")
      .set("Authorization", `Bearer ${body.token}`)
      .send({ currentPassword: "wrongpass1", newPassword: "newpass456" })
      .expect(400);
    await request.get("/api/auth/me").set("Authorization", `Bearer ${body.token}`).expect(200);
  });

  it("invalidates old tokens after a password change", async () => {
    const { body } = await request.post("/api/auth/register").send(valid);
    const res = await request
      .patch("/api/auth/password")
      .set("Authorization", `Bearer ${body.token}`)
      .send({ currentPassword: valid.password, newPassword: "newpass456" })
      .expect(200);

    await request.get("/api/auth/me").set("Authorization", `Bearer ${body.token}`).expect(401);
    await request.get("/api/auth/me").set("Authorization", `Bearer ${res.body.token}`).expect(200);
  });
});
