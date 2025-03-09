import "reflect-metadata";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message:
    "Too many login attempts from this IP, please try again after 15 minutes.",
});

app.use("/api/v1", apiLimiter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully.");
    app.listen(port, () => {
      console.log(
        `Server running on port ${port} in ${process.env.NODE_ENV} mode`
      );
      console.log(
        `Swagger docs available at http://localhost:${port}/api-docs`
      );
    });
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
    process.exit(1);
  });
