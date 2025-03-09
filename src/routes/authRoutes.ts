import { Router } from "express";
import {
  signup,
  login,
  refreshToken,
  getMe,
} from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.get("/me", protect, getMe); // Protect this route

export default router;
