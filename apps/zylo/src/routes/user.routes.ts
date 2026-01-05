import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  userProfile,
  repoListController,
  repoPreviewController,
  externalUrlController,
  importRepoController,
  frameworkDetectController,
  deployProjectController,
  repoInnerDirectoriesController,
  deployDashboard,
  projectDashboard,
  userProfileYT,
  createNewPipeline,
  userPipelines,
  getPipelineByName,
  deletePipelineByName,
  editConfig,
  configAdavancedSettingsByName,
  trashController,
  startAutomationController,
  countThePipelines,
  getMembersBypipeline,
  inviteMembersToPipeline
} from '../controllers/zylo.controller.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/me', authMiddleware, userProfile);
router.get('/new', authMiddleware, repoListController);
router.post('/preview', authMiddleware, repoPreviewController);
router.post('/github-url', authMiddleware, externalUrlController);
router.post('/new/import', authMiddleware, importRepoController);
router.post('/new/framework', authMiddleware, frameworkDetectController);
router.post('/new/deploy', authMiddleware, deployProjectController as any);
router.post('/new/inner-dir', authMiddleware, repoInnerDirectoriesController);
router.post('/deploy-dashboard', authMiddleware, deployDashboard);
router.get('/dashboard', authMiddleware, projectDashboard);
router.get('/yt-pipeline/me', authMiddleware, userProfileYT);
router.post('/create/pipeline', authMiddleware, upload.single('image'), createNewPipeline);
router.get('/pipelines', authMiddleware, userPipelines);
router.post('/pipelines/:name', authMiddleware, getPipelineByName);
router.post('/update-pipelines/:name', authMiddleware, upload.single('image'), editConfig);
router.delete('/delete-pipeline/:name', authMiddleware, deletePipelineByName);
router.post('/update-advancedsettings/:name', authMiddleware, configAdavancedSettingsByName);
router.post('/trash', authMiddleware, trashController);
router.post('/pipeline/run/:name', authMiddleware, startAutomationController);
router.get('/get-count-pipelines', authMiddleware, countThePipelines);
router.get('/get-members/:name', authMiddleware, getMembersBypipeline);
router.post("/pipelines/:name/invites", authMiddleware,inviteMembersToPipeline );
export default router;
