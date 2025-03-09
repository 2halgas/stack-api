import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";
import { AppError } from "./errorHandler";
import { UserRole } from "../models/User";

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expecting "Bearer <token>"

  if (!token) {
    return next(new AppError("No token provided", 401));
  }

  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded; // Add user info to request
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
