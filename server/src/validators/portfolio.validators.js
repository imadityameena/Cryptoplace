import { body, param, query } from "express-validator";
import { SUPPORTED_CURRENCIES } from "../utils/constants.js";
import { coinIdBody } from "./coin.validators.js";

const typeRule = body("type").isIn(["buy", "sell"]).withMessage("type must be 'buy' or 'sell'");
const quantityRule = body("quantity")
  .isFloat({ gt: 0 })
  .withMessage("quantity must be greater than 0")
  .toFloat();
const priceRule = body("pricePerCoin")
  .isFloat({ min: 0 })
  .withMessage("pricePerCoin must be 0 or more")
  .toFloat();
const feeRule = body("fee").optional().isFloat({ min: 0 }).withMessage("fee must be 0 or more").toFloat();
const currencyRule = body("currency")
  .optional()
  .trim()
  .toLowerCase()
  .isIn(SUPPORTED_CURRENCIES)
  .withMessage(`currency must be one of: ${SUPPORTED_CURRENCIES.join(", ")}`);
const dateRule = body("date")
  .optional()
  .isISO8601()
  .withMessage("date must be a valid ISO 8601 date")
  .custom((value) => new Date(value) <= new Date())
  .withMessage("date cannot be in the future");
const noteRule = body("note").optional().isString().trim().isLength({ max: 200 });

export const transactionIdParam = param("id").isMongoId().withMessage("Invalid transaction id");

export const createTransactionRules = [
  coinIdBody,
  typeRule,
  quantityRule,
  priceRule,
  feeRule,
  currencyRule,
  dateRule,
  noteRule,
];

export const updateTransactionRules = [
  transactionIdParam,
  typeRule.optional(),
  quantityRule.optional(),
  priceRule.optional(),
  feeRule,
  currencyRule,
  dateRule,
  noteRule,
];

export const listTransactionRules = [
  query("coinId").optional().trim().toLowerCase().matches(/^[a-z0-9-]+$/),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];
