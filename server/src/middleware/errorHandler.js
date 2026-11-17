import ApiError from "../utils/ApiError.js";
import env from "../config/env.js";

export const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let details = err.details;

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  }

  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists` : "Duplicate entry";
  }

  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Malformed JSON body";
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 && env.isProduction ? "Internal server error" : message,
    ...(details && { details }),
    ...(!env.isProduction && statusCode >= 500 && { stack: err.stack }),
  });
};
