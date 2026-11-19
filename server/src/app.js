import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import env from "./config/env.js";
import routes from "./routes/index.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl
      .split(",")
      .map((url) => url.trim().replace(/\/+$/, ""))
      .filter(Boolean),
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));

if (!env.isProduction) {
  app.use(morgan("dev"));
}

app.use("/api", apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
