import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
import authRoutes from "./routes/auth.routes.js";
import { AppError } from "./errorHandler/error.handler.js";

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    exposedHeaders: ["set-cookie"],
  })
);
app.use(cookieParser());


app.use("/auth", authRoutes);
app.get("/health", (req, res) => {
  res.send("working");
});

app.listen(PORT, () => {
  console.log(`App is up and running on ${PORT}`);
});
