import express from "express";
import {
  oauthGithubController,
  redirectHandlerGithubController,
  logoutController
} from "../controllers/auth.controller.js";

const router = express.Router();
router.get("/github", oauthGithubController);
router.get("/github/callback", redirectHandlerGithubController);
router.post("/logout", logoutController);

export default router;
