import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { User, UserRole } from "../models/User";
import { AppError } from "../middleware/errorHandler";

const userRepository = AppDataSource.getRepository(User);

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await userRepository.find({
      select: ["id", "name", "email", "role", "createdAt"],
    });
    res.json({ status: "success", data: users });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userRepository.findOne({
      where: { id: parseInt(req.params.id) },
      select: ["id", "name", "email", "role", "createdAt"],
    });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    res.json({ status: "success", data: user });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new AppError("Please provide name, email and password", 400);
    }

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError("Email already in use", 400);
    }

    const user = userRepository.create({
      name,
      email,
      password,
      role: UserRole.USER,
    });
    await userRepository.save(user);

    res.status(201).json({
      status: "success",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userRepository.findOne({
      where: { id: parseInt(req.params.id) },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    userRepository.merge(user, req.body);
    const updatedUser = await userRepository.save(user);

    res.json({
      status: "success",
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await userRepository.delete(req.params.id);

    if (result.affected === 0) {
      throw new AppError("User not found", 404);
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
