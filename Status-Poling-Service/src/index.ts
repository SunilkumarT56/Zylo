import express from "express";
import redis from "redis";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const PORT = process.env.PORT;

const subscriber = redis.createClient();
subscriber.connect();
subscriber.on("ready", () => console.log("Redis connected"));

const app = express();
app.use(cors());

app.get("/api/status", async (req, res) => {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid id parameter" });
  }
  const response = await subscriber.hGet("status", id);
  res.json({ status: response });
});

app.listen(PORT, () => {
  console.log("Server is running on port 5001");
});
