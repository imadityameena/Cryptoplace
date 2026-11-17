import Alert from "../models/Alert.js";
import * as coingecko from "../services/coingecko.service.js";
import ApiError from "../utils/ApiError.js";

const MAX_ACTIVE_ALERTS = 50;
const EDITABLE_FIELDS = ["condition", "targetPrice", "currency", "note", "status"];

const findOwnAlert = async (req) => {
  const alert = await Alert.findOne({ _id: req.params.id, user: req.user._id });
  if (!alert) throw ApiError.notFound("Alert not found");
  return alert;
};

export const listAlerts = async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.coinId) filter.coinId = req.query.coinId.trim().toLowerCase();

  const alerts = await Alert.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: alerts });
};

export const getAlert = async (req, res) => {
  res.json({ success: true, data: await findOwnAlert(req) });
};

export const createAlert = async (req, res) => {
  const { coinId, condition, targetPrice, note } = req.body;
  const currency = req.body.currency || req.user.preferredCurrency;

  const activeCount = await Alert.countDocuments({ user: req.user._id, status: "active" });
  if (activeCount >= MAX_ACTIVE_ALERTS) {
    throw ApiError.badRequest(`You can have at most ${MAX_ACTIVE_ALERTS} active alerts`);
  }

  await coingecko.assertCoinExists(coinId);

  const alert = await Alert.create({
    user: req.user._id,
    coinId,
    condition,
    targetPrice,
    currency,
    note,
  });

  res.status(201).json({ success: true, data: alert });
};

export const updateAlert = async (req, res) => {
  const alert = await findOwnAlert(req);

  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) alert[field] = req.body[field];
  }

  // Changing the rule re-arms a triggered alert
  const ruleChanged = ["condition", "targetPrice", "currency"].some((f) => alert.isModified(f));
  if (alert.status === "triggered" && ruleChanged) alert.status = "active";
  if (alert.status === "active") {
    alert.triggeredAt = undefined;
    alert.triggeredPrice = undefined;
  }

  await alert.save();
  res.json({ success: true, data: alert });
};

export const deleteAlert = async (req, res) => {
  const alert = await findOwnAlert(req);
  await alert.deleteOne();
  res.status(204).end();
};
