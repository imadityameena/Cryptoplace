import dotenv from "dotenv";

dotenv.config({ quiet: true });

const required = ["MONGO_URI", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  coingeckoApiKey: process.env.COINGECKO_API_KEY || "",
  coingeckoBaseUrl:
    process.env.COINGECKO_BASE_URL || "https://api.coingecko.com/api/v3",
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS) || 60,
  alertCheckIntervalSeconds: Number(process.env.ALERT_CHECK_INTERVAL_SECONDS) || 120,
};

env.isProduction = env.nodeEnv === "production";

export default env;
