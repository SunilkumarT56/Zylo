import express from "express";
import cors from "cors";
import authRoutes from "./routes/user.routes.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 7004;
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization" , "ngrok-skip-browser-warning"],
  })
);

app.use("/", authRoutes);

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});