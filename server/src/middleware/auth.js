import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { verifyToken } from "../utils/token.js";

export const protect = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw ApiError.unauthorized("Authentication token missing");
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }

  const user = await User.findById(payload.sub).select("+tokenVersion");
  if (!user) throw ApiError.unauthorized("User no longer exists");

  if ((payload.v || 0) !== user.tokenVersion) {
    throw ApiError.unauthorized("Session expired, please log in again");
  }

  req.user = user;
  next();
};
