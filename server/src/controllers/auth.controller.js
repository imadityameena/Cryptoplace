import User from "../models/User.js";
import WatchlistItem from "../models/WatchlistItem.js";
import Transaction from "../models/Transaction.js";
import Alert from "../models/Alert.js";
import ApiError from "../utils/ApiError.js";
import { signToken } from "../utils/token.js";

const sendAuth = (res, statusCode, user) => {
  res.status(statusCode).json({
    success: true,
    token: signToken(user),
    user,
  });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const user = await User.create({ name, email, password });
  sendAuth(res, 201, user);
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password +tokenVersion");
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  sendAuth(res, 200, user);
};

export const getMe = (req, res) => {
  res.json({ success: true, user: req.user });
};

export const updateMe = async (req, res) => {
  const { name, preferredCurrency } = req.body;
  if (name !== undefined) req.user.name = name;
  if (preferredCurrency !== undefined) req.user.preferredCurrency = preferredCurrency;

  await req.user.save();
  res.json({ success: true, user: req.user });
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password +tokenVersion");
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.unauthorized("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();
  sendAuth(res, 200, user);
};

export const deleteMe = async (req, res) => {
  await Promise.all([
    WatchlistItem.deleteMany({ user: req.user._id }),
    Transaction.deleteMany({ user: req.user._id }),
    Alert.deleteMany({ user: req.user._id }),
  ]);
  await User.findByIdAndDelete(req.user._id);
  res.status(204).end();
};
