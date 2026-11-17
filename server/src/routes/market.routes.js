import { Router } from "express";
import {
  listCoins,
  getCoin,
  getCoinChart,
  search,
  trending,
  currencies,
} from "../controllers/market.controller.js";

const router = Router();

router.get("/currencies", currencies);
router.get("/coins", listCoins);
router.get("/coins/:id", getCoin);
router.get("/coins/:id/chart", getCoinChart);
router.get("/search", search);
router.get("/trending", trending);

export default router;
