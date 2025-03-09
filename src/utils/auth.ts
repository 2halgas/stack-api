import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { AppError } from "../middleware/errorHandler";
import { UserRole } from "../models/User";

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: number, role: UserRole): string => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "1h" }
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
  } catch (err) {
    throw new AppError("Invalid or expired token", 401);
  }
};
