import "reflect-metadata";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import { protect } from "./middleware/auth";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));

// General rate limiter for all API endpoints (optional)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later.",
});

// Specific rate limiter for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message:
    "Too many login attempts from this IP, please try again after 15 minutes.",
});

// Routes
app.use("/api/v1", apiLimiter);
app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/users", userRoutes);

// Global error handling
app.use(errorHandler);

// Database connection and server startup
AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully.");
    app.listen(port, () => {
      console.log(
        `Server running on port ${port} in ${process.env.NODE_ENV} mode`
      );
    });
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
    process.exit(1);
  });
