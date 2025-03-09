import "reflect-metadata";
import express, { Request, Response } from "express";
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
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { createStream } from "rotating-file-stream";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));

// Morgan setup
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // Console logging in dev mode
}

const logDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}
const accessLogStream = createStream("access.log", {
  interval: "1d", // Rotate daily
  path: logDirectory,
  compress: "gzip", // Compress old logs
});

// File logging
app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
    { stream: accessLogStream }
  )
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/v1", apiLimiter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

// Cleanup logs older than 7 days
const cleanupOldLogs = () => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const logFiles = fs.readdirSync(logDirectory);
  logFiles.forEach((file) => {
    const filePath = path.join(logDirectory, file);
    const stats = fs.statSync(filePath);
    if (stats.mtime < oneWeekAgo) {
      fs.unlinkSync(filePath); // Delete files older than 7 days
    }
  });
};

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully.");
    cleanupOldLogs(); // Initial cleanup
    setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000); // Daily cleanup

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
