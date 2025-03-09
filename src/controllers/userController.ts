import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../models/User";
import { AppError } from "../middleware/errorHandler";

const userRepository = AppDataSource.getRepository(User);

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await userRepository.find({
      select: ["id", "name", "email", "createdAt"],
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
      where: { id: req.params.id }, // No parseInt needed
      select: ["id", "name", "email", "createdAt"],
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

    const user = userRepository.create({ name, email, password });
    await userRepository.save(user);

    res.status(201).json({
      status: "success",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
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
      where: { id: req.params.id }, // No parseInt needed
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
    const result = await userRepository.delete(req.params.id); // No parseInt needed

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
