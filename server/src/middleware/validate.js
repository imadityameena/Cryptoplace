import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) return next();

    const details = result.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    next(ApiError.badRequest("Validation failed", details));
  },
];

export default validate;
