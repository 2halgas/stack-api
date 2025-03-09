import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../models/User";
import { AppError } from "../middleware/errorHandler";
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  compareRefreshToken,
} from "../utils/auth";

const userRepository = AppDataSource.getRepository(User);

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new AppError("Please provide name, email, and password", 400);
    }

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError("Email already in use", 400);
    }

    const user = userRepository.create({ name, email, password });
    const refreshToken = generateRefreshToken(user.id);
    user.refreshToken = refreshToken;
    await userRepository.save(user);

    const accessToken = generateAccessToken(user.id, user.role);

    res.status(201).json({
      status: "success",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("Please provide email and password", 400);
    }

    const user = await userRepository.findOne({ where: { email } });
    if (!user || !(await comparePassword(password, user.password))) {
      throw new AppError("Incorrect email or password", 401);
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    user.refreshToken = refreshToken;
    await userRepository.save(user);

    res.status(200).json({
      status: "success",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError("Refresh token required", 400);
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await userRepository.findOne({ where: { id: decoded.id } });

    if (
      !user ||
      !user.refreshToken ||
      !(await compareRefreshToken(refreshToken, user.refreshToken))
    ) {
      throw new AppError("Invalid refresh token", 401);
    }

    const newAccessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);
    user.refreshToken = newRefreshToken;
    await userRepository.save(user);

    res.status(200).json({
      status: "success",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id; // Get ID from JWT
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Clear the refresh token
    user.refreshToken = null as any; // Set to null to invalidate
    await userRepository.save(user);

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};
