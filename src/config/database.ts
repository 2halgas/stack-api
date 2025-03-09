import { DataSource } from "typeorm";
import { User } from "../models/User";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: process.env.NODE_ENV === "development", // Disable in production
  logging: process.env.NODE_ENV === "development",
  entities: [User],
  subscribers: [],
  migrations: [],
});
