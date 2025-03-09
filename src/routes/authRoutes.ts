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
import rateLimit from "express-rate-limit"; // Add this import

const router = Router();

// Rate limiter for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message:
    "Too many login attempts from this IP, please try again after 15 minutes.",
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message:
    "Too many password reset requests from this IP, please try again after 1 hour.",
});

router.post("/signup", signup);
router.post("/login", loginLimiter, login);
router.post("/refresh", refreshToken);
router.post("/logout", protect, logout);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
