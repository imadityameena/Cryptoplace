import { Router } from "express";
import {
  listAlerts,
  getAlert,
  createAlert,
  updateAlert,
  deleteAlert,
} from "../controllers/alert.controller.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
  createAlertRules,
  updateAlertRules,
  listAlertRules,
  alertIdParam,
} from "../validators/alert.validators.js";

const router = Router();

router.use(protect);

router.get("/", validate(listAlertRules), listAlerts);
router.post("/", validate(createAlertRules), createAlert);
router.get("/:id", validate([alertIdParam]), getAlert);
router.patch("/:id", validate(updateAlertRules), updateAlert);
router.delete("/:id", validate([alertIdParam]), deleteAlert);

export default router;
