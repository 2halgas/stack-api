import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../models/User";
import { ResetToken } from "../models/ResetToken";
import { AppError } from "../middleware/errorHandler";
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  compareRefreshToken,
} from "../utils/auth";
import { sendResetEmail } from "../utils/email";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { MoreThan } from "typeorm";
import validator from "validator";

const userRepository = AppDataSource.getRepository(User);
const resetTokenRepository = AppDataSource.getRepository(ResetToken);

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

    if (!validator.isEmail(email)) {
      throw new AppError("Please provide a valid email address", 400);
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
    if (!user) {
      throw new AppError("Incorrect email or password", 401);
    }

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
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
    const userId = (req as any).user.id;
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.refreshToken = null as any;
    await userRepository.save(user);

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new AppError("Please provide an email", 400);
    }

    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({
        status: "success",
        message: "If the email exists, a reset link has been sent",
      });
    }

    const token = uuidv4();
    const hashedToken = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const resetToken = resetTokenRepository.create({
      token: hashedToken,
      user,
      expiresAt,
    });
    await resetTokenRepository.save(resetToken);

    await sendResetEmail(user.email, token);

    res.status(200).json({
      status: "success",
      message: "If the email exists, a reset link has been sent",
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      throw new AppError("Please provide token and new password", 400);
    }

    const resetToken = await resetTokenRepository.findOne({
      relations: ["user"],
      where: { expiresAt: MoreThan(new Date()) },
    });

    if (!resetToken || !(await bcrypt.compare(token, resetToken.token))) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    const user = resetToken.user;
    user.password = password;
    user.refreshToken = null as any;
    await userRepository.save(user);

    await resetTokenRepository.delete(resetToken.id);

    res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (err) {
    next(err);
  }
};
