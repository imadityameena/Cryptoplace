import mongoose from "../config/mongoose.js";

const watchlistItemSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

watchlistItemSchema.index({ user: 1, coinId: 1 }, { unique: true });

const WatchlistItem = mongoose.model("WatchlistItem", watchlistItemSchema);

export default WatchlistItem;
