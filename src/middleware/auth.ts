import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/auth";
import { AppError } from "./errorHandler";
import { UserRole } from "../models/User";

import * as bcrypt from "bcryptjs";

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expecting "Bearer <token>"

  if (!token) {
    return next(new AppError("No token provided", 401));
  }

  try {
    const decoded = verifyAccessToken(token);
    (req as any).user = decoded; // Attach decoded token (id, role) to req.user
    next();
  } catch (err) {
    next(err);
  }
};

export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user.role as UserRole;
    if (!roles.includes(userRole)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
