import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../models/User";
import { AppError } from "../middleware/errorHandler";
import { comparePassword, generateToken } from "../utils/auth";

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
    await userRepository.save(user);

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      status: "success",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
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

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      status: "success",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};
