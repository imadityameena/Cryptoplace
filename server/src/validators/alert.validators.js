import { body, param, query } from "express-validator";
import { SUPPORTED_CURRENCIES } from "../utils/constants.js";
import { coinIdBody } from "./coin.validators.js";

const conditionRule = body("condition")
  .isIn(["above", "below"])
  .withMessage("condition must be 'above' or 'below'");
const targetRule = body("targetPrice")
  .isFloat({ gt: 0 })
  .withMessage("targetPrice must be greater than 0")
  .toFloat();
const currencyRule = body("currency")
  .optional()
  .trim()
  .toLowerCase()
  .isIn(SUPPORTED_CURRENCIES)
  .withMessage(`currency must be one of: ${SUPPORTED_CURRENCIES.join(", ")}`);
const noteRule = body("note").optional().isString().trim().isLength({ max: 200 });

export const alertIdParam = param("id").isMongoId().withMessage("Invalid alert id");

export const createAlertRules = [coinIdBody, conditionRule, targetRule, currencyRule, noteRule];

export const updateAlertRules = [
  alertIdParam,
  conditionRule.optional(),
  targetRule.optional(),
  currencyRule,
  noteRule,
  body("status")
    .optional()
    .isIn(["active", "paused"])
    .withMessage("status must be 'active' or 'paused'"),
];

export const listAlertRules = [
  query("status").optional().isIn(["active", "triggered", "paused"]),
  query("coinId").optional().trim().toLowerCase().matches(/^[a-z0-9-]+$/),
];
