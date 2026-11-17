import ApiError from "./ApiError.js";
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from "./constants.js";

export const resolveCurrency = (value, fallback = DEFAULT_CURRENCY) => {
  const currency = (value || fallback).toLowerCase();
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    throw ApiError.badRequest(
      `Unsupported currency. Use one of: ${SUPPORTED_CURRENCIES.join(", ")}`
    );
  }
  return currency;
};
