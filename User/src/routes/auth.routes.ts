import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authMe } from "../controllers/auth.controller.js";


const router = express.Router();

router.get("/me", authMiddleware,authMe);
router.get("/health", (req , res) => {
  res.json({
    message: "user service is running",
  })
})

export default router;

