import mongoose from "mongoose";
import env from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

export const disconnectDB = () => mongoose.connection.close();
