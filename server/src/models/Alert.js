import mongoose from "../config/mongoose.js";
import { SUPPORTED_CURRENCIES } from "../utils/constants.js";

const alertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    coinId: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    condition: {
      type: String,
      enum: ["above", "below"],
      required: true,
    },
    targetPrice: {
      type: Number,
      required: true,
      min: [0, "Target price cannot be negative"],
    },
    currency: {
      type: String,
      enum: SUPPORTED_CURRENCIES,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "triggered", "paused"],
      default: "active",
    },
    triggeredAt: Date,
    triggeredPrice: Number,
    note: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  { timestamps: true }
);

alertSchema.index({ status: 1, coinId: 1 });

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;
