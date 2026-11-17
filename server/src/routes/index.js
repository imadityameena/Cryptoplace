import { Router } from "express";
import marketRoutes from "./market.routes.js";
import authRoutes from "./auth.routes.js";
import watchlistRoutes from "./watchlist.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, status: "ok", uptime: process.uptime() });
});

router.use("/auth", authRoutes);
router.use("/market", marketRoutes);
router.use("/watchlist", watchlistRoutes);

export default router;
