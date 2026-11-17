import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import supertest from "supertest";
import { app, start, stop, resetDb } from "./setup.js";
import googleAuth from "../src/services/google.service.js";
import ApiError from "../src/utils/ApiError.js";

const request = supertest(app);

// Tokens used in tests map to fake verified Google profiles
const PROFILES = {
  "token-new": { googleId: "g-1", email: "newuser@gmail.com", name: "New User", avatar: "https://img/1" },
  "token-existing": { googleId: "g-2", email: "existing@gmail.com", name: "Existing", avatar: "https://img/2" },
};

googleAuth.isConfigured = () => true;
googleAuth.verifyIdToken = async (token) => {
  if (!PROFILES[token]) throw ApiError.unauthorized("Google sign-in failed, please try again");
  return PROFILES[token];
};

const google = (credential) => request.post("/api/auth/google").send({ credential });

describe("Google sign-in", () => {
  before(start);
  after(stop);
  beforeEach(resetDb);

  it("creates an account on first sign-in and logs in afterwards", async () => {
    const first = await google("token-new").expect(201);
    assert.ok(first.body.token);
    assert.equal(first.body.user.email, "newuser@gmail.com");
    assert.equal(first.body.user.hasPassword, false);
    assert.equal(first.body.user.googleId, undefined);

    const second = await google("token-new").expect(200);
    assert.equal(second.body.user.id, first.body.user.id);
  });

  it("links Google to an existing password account with the same email", async () => {
    const reg = await request
      .post("/api/auth/register")
      .send({ name: "Existing", email: "existing@gmail.com", password: "password123" });

    const res = await google("token-existing").expect(200);
    assert.equal(res.body.user.id, reg.body.user.id);
    assert.equal(res.body.user.hasPassword, true);

    await request
      .post("/api/auth/login")
      .send({ email: "existing@gmail.com", password: "password123" })
      .expect(200);
  });

  it("rejects invalid Google credentials", async () => {
    await google("forged").expect(401);
    await request.post("/api/auth/google").send({}).expect(400);
  });

  it("explains password login for Google-only accounts and lets them set a password", async () => {
    const { body } = await google("token-new");

    const login = await request
      .post("/api/auth/login")
      .send({ email: "newuser@gmail.com", password: "password123" })
      .expect(401);
    assert.match(login.body.message, /Google/);

    const set = await request
      .patch("/api/auth/password")
      .set("Authorization", `Bearer ${body.token}`)
      .send({ newPassword: "password123" })
      .expect(200);
    assert.equal(set.body.user.hasPassword, true);

    await request
      .post("/api/auth/login")
      .send({ email: "newuser@gmail.com", password: "password123" })
      .expect(200);

    // Once a password exists, changing it requires the current one
    await request
      .patch("/api/auth/password")
      .set("Authorization", `Bearer ${set.body.token}`)
      .send({ newPassword: "another456" })
      .expect(400);
  });

  it("reports whether Google sign-in is configured", async () => {
    const res = await request.get("/api/auth/google/config").expect(200);
    assert.ok("clientId" in res.body);
  });
});
