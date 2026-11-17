import Alert from "../models/Alert.js";
import { getSimplePrice } from "./coingecko.service.js";

const BATCH_SIZE = 100;

const isHit = (alert, price) =>
  alert.condition === "above" ? price >= alert.targetPrice : price <= alert.targetPrice;

export const checkAlerts = async () => {
  const active = await Alert.find({ status: "active" })
    .select("coinId currency condition targetPrice")
    .lean();
  if (!active.length) return 0;

  const coinIds = [...new Set(active.map((a) => a.coinId))];
  const currencies = [...new Set(active.map((a) => a.currency))];

  const prices = {};
  for (let i = 0; i < coinIds.length; i += BATCH_SIZE) {
    Object.assign(
      prices,
      await getSimplePrice({ ids: coinIds.slice(i, i + BATCH_SIZE), currencies })
    );
  }

  const now = new Date();
  const updates = [];

  for (const alert of active) {
    const price = prices[alert.coinId]?.[alert.currency];
    if (typeof price !== "number" || !isHit(alert, price)) continue;

    updates.push({
      updateOne: {
        filter: { _id: alert._id, status: "active" },
        update: { $set: { status: "triggered", triggeredAt: now, triggeredPrice: price } },
      },
    });
  }

  if (updates.length) await Alert.bulkWrite(updates);
  return updates.length;
};

export const startAlertChecker = (intervalSeconds) => {
  let running = false;

  const run = async () => {
    if (running) return;
    running = true;
    try {
      const triggered = await checkAlerts();
      if (triggered) console.log(`Price alerts triggered: ${triggered}`);
    } catch (err) {
      console.error(`Alert check failed: ${err.message}`);
    } finally {
      running = false;
    }
  };

  run();
  const timer = setInterval(run, intervalSeconds * 1000);
  timer.unref();
  return () => clearInterval(timer);
};
