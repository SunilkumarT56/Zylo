import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { userProfile } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/me", authMiddleware, userProfile);
router.get("/health", (req, res) => {
  res.json({
    message: "user service is running",
  });
});

export default router;
