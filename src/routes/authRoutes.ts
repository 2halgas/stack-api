import { Router } from "express";
import {
  signup,
  login,
  refreshToken,
  logout,
} from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", protect, logout); // Add this route

export default router;
