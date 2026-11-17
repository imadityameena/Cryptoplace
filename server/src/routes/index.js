import { Router } from "express";
import marketRoutes from "./market.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, status: "ok", uptime: process.uptime() });
});

router.use("/market", marketRoutes);

export default router;
