import { Router } from "express";
import {
  getPortfolio,
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/portfolio.controller.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
  createTransactionRules,
  updateTransactionRules,
  listTransactionRules,
  transactionIdParam,
} from "../validators/portfolio.validators.js";

const router = Router();

router.use(protect);

router.get("/", getPortfolio);
router.get("/transactions", validate(listTransactionRules), listTransactions);
router.post("/transactions", validate(createTransactionRules), createTransaction);
router.get("/transactions/:id", validate([transactionIdParam]), getTransaction);
router.patch("/transactions/:id", validate(updateTransactionRules), updateTransaction);
router.delete("/transactions/:id", validate([transactionIdParam]), deleteTransaction);

export default router;
