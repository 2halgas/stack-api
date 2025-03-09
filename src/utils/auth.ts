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

export const generateAccessToken = (userId: string, role: UserRole): string => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
    { expiresIn: "1d" }
  );
};

export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
  } catch (err) {
    throw new AppError("Invalid or expired access token", 401);
  }
};

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"
    );
  } catch (err) {
    throw new AppError("Invalid or expired refresh token", 401);
  }
};

export const compareRefreshToken = async (
  token: string,
  hashedToken: string
): Promise<boolean> => {
  return bcrypt.compare(token, hashedToken);
};
