import mongoose from "../config/mongoose.js";
import { SUPPORTED_CURRENCIES } from "../utils/constants.js";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coinId: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["buy", "sell"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity must be positive"],
    },
    pricePerCoin: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    fee: {
      type: Number,
      default: 0,
      min: [0, "Fee cannot be negative"],
    },
    currency: {
      type: String,
      enum: SUPPORTED_CURRENCIES,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, coinId: 1, date: 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
