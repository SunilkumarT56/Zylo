import express from "express";
import {
  oauthGithubController,
  redirectHandlerGithubController,
  logoutController,
  emailRequestController
} from "../controllers/auth.controller.js";

const router = express.Router();
router.post("/email",emailRequestController)
router.get("/github", oauthGithubController);
router.get("/github/callback", redirectHandlerGithubController);
router.post("/logout", logoutController);
router.get("/health", (req, res) => {
  res.send("working");
});


export default router;
