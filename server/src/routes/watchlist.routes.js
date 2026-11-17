import { Router } from "express";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  clearWatchlist,
} from "../controllers/watchlist.controller.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { coinIdBody, coinIdParam } from "../validators/coin.validators.js";

const router = Router();

router.use(protect);

router.get("/", getWatchlist);
router.post("/", validate([coinIdBody]), addToWatchlist);
router.delete("/", clearWatchlist);
router.delete("/:coinId", validate([coinIdParam]), removeFromWatchlist);

export default router;
