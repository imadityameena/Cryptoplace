import { body } from "express-validator";
import { SUPPORTED_CURRENCIES } from "../utils/constants.js";

const passwordRule = (field) =>
  body(field)
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be 8-128 characters")
    .matches(/[A-Za-z]/)
    .withMessage("Password must contain a letter")
    .matches(/\d/)
    .withMessage("Password must contain a number");

export const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 50 }),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  passwordRule("password"),
];

export const loginRules = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const updateProfileRules = [
  body("name").optional().trim().notEmpty().isLength({ max: 50 }),
  body("preferredCurrency")
    .optional()
    .isIn(SUPPORTED_CURRENCIES)
    .withMessage(`Currency must be one of: ${SUPPORTED_CURRENCIES.join(", ")}`),
];

export const changePasswordRules = [
  body("currentPassword").optional().isString(),
  passwordRule("newPassword"),
];

export const googleLoginRules = [
  body("credential").isString().notEmpty().withMessage("Google credential is required"),
];
