import mongoose from "../src/config/mongoose.js";
import { connectDB, disconnectDB } from "../src/config/db.js";
import { mongo } from "./env.js";

export { default as app } from "../src/app.js";

export const start = () => connectDB();

export const stop = async () => {
  await disconnectDB();
  await mongoose.disconnect();
  await mongo.stop();
};

export const resetDb = async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
};

let counter = 0;
export const createUser = async (request) => {
  counter += 1;
  const res = await request
    .post("/api/auth/register")
    .send({ name: "Test", email: `user${counter}@test.com`, password: "password123" });
  return { token: res.body.token, user: res.body.user };
};
