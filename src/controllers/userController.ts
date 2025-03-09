import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../models/User";
import { AppError } from "../middleware/errorHandler";
import validator from "validator";

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
      where: { id: req.params.id },
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

    if (!validator.isEmail(email)) {
      throw new AppError("Please provide a valid email address", 400);
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
    const { name, email } = req.body;
    const user = await userRepository.findOne({
      where: { id: req.params.id },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (email && email !== user.email) {
      if (!validator.isEmail(email)) {
        throw new AppError("Please provide a valid email address", 400);
      }
      const existingUser = await userRepository.findOne({
        where: { email },
      });
      if (existingUser && existingUser.id !== user.id) {
        throw new AppError("Email already in use", 400);
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

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

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const user = await userRepository.findOne({
      where: { id: userId },
      select: ["id", "name", "email", "role", "createdAt"],
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const { name, email } = req.body;

    // Fetch the current user
    const user = await userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if email is being updated and already exists for another user
    if (email && email !== user.email) {
      const existingUser = await userRepository.findOne({
        where: { email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new AppError("Email already in use", 400);
      }
      user.email = email;
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    // Save changes
    const updatedUser = await userRepository.save(user);

    res.status(200).json({
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
