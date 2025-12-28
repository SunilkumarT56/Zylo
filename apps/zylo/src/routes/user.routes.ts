import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  userProfile,
  repoListController,
  repoPreviewController,
  externalUrlController,
  importRepoController,
  frameworkDetectController,
  deployProjectController,
  repoInnerDirectoriesController,
  deployDashboard
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", authMiddleware, userProfile);
router.get("/new", authMiddleware, repoListController);
router.post("/preview", authMiddleware, repoPreviewController);
router.post("/github-url", authMiddleware, externalUrlController);
router.post("/new/import", authMiddleware, importRepoController);
router.post("/new/framework", authMiddleware, frameworkDetectController);
router.post("/new/deploy", authMiddleware, deployProjectController as any);
router.post("/new/inner-dir", authMiddleware, repoInnerDirectoriesController);
router.post("/deploy-dashboard" , authMiddleware , deployDashboard)

export default router;
