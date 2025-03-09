import { Router } from "express";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMe, // Add this
} from "../controllers/userController";
import { restrictTo } from "../middleware/auth";
import { UserRole } from "../models/User";
import { protect } from "../middleware/auth"; // Ensure this is imported

const router = Router();

router.route("/").get(getUsers).post(createUser);
router
  .route("/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(restrictTo(UserRole.ADMIN), deleteUser);
router.get("/me", protect, getMe); // Add this route

export default router;
