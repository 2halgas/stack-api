import { Router } from "express";
import {
  signup,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", protect, logout); // Add this route
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
