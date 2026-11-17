import { body, param } from "express-validator";

const COIN_ID_PATTERN = /^[a-z0-9-]+$/;

export const coinIdBody = body("coinId")
  .trim()
  .toLowerCase()
  .notEmpty()
  .withMessage("coinId is required")
  .matches(COIN_ID_PATTERN)
  .withMessage("Invalid coinId");

export const coinIdParam = param("coinId")
  .trim()
  .toLowerCase()
  .matches(COIN_ID_PATTERN)
  .withMessage("Invalid coinId");
