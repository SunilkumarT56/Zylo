import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
import authRoutes from "./routes/auth.routes.js";
import { redisClient } from "./config/redis.js";

const PORT = process.env.PORT;

const app = express();

async function redisConnect() {
  redisClient.connect();
}

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    exposedHeaders: ["set-cookie"],
  })
);
app.use(cookieParser());

app.use("/", authRoutes);

app.listen(PORT, () => {
  console.log(`App is up and running on ${PORT}`);
});

await redisConnect();
