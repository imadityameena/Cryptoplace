import app from "./app.js";
import env from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { startAlertChecker } from "./services/alertChecker.service.js";

const start = async () => {
  await connectDB();

  const server = app.listen(env.port, (err) => {
    if (err) {
      console.error(`Failed to start server: ${err.message}`);
      process.exit(1);
    }
    console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
  });

  const stopAlertChecker = startAlertChecker(env.alertCheckIntervalSeconds);

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    stopAlertChecker();
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("unhandledRejection", (err) => {
    console.error("Unhandled rejection:", err);
    server.close(() => process.exit(1));
  });
};

start();
