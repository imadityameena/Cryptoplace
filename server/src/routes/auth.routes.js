import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  deleteMe,
  googleConfig,
  googleLogin,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules,
  googleLoginRules,
} from "../validators/auth.validators.js";

const router = Router();

router.post("/register", authLimiter, validate(registerRules), register);
router.post("/login", authLimiter, validate(loginRules), login);
router.get("/google/config", googleConfig);
router.post("/google", authLimiter, validate(googleLoginRules), googleLogin);

router.use(protect);
router.get("/me", getMe);
router.patch("/me", validate(updateProfileRules), updateMe);
router.delete("/me", deleteMe);
router.patch("/password", validate(changePasswordRules), changePassword);

export default router;
