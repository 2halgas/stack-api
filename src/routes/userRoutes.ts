import { Router } from "express";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import { restrictTo } from "../middleware/auth";
import { UserRole } from "../models/User";

const router = Router();

router.route("/").get(getUsers).post(createUser);
router
  .route("/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(restrictTo(UserRole.ADMIN), deleteUser); // Only admins can delete users

export default router;
