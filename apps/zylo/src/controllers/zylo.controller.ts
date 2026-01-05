import type { Request, Response } from 'express';
import type {
  AuthenticateUserRequest,
  ContentSourceConfig,
  DeployData,
  MetadataStrategy,
  ThumbnailConfig,
  YouTubeConfig,
  ScheduleConfig,
  AutomationValidationResult,
} from '@zylo/types';
import { pool } from '../config/postgresql.js';
import axios from 'axios';
import { enqueueEvent } from '../config/enque.js';
import {
  getLastCommits,
  getAllRepoDirectories,
  getRepoDirectoryContents,
  detectFrontendFramework,
} from '../services/github.service.js';
import { ERROR_CODES } from '@zylo/errors';
import { AsyncHandler } from '../utils/asyncHandler.js';
import { fetchMyChannelDetails, getValidGoogleAccessToken } from '../services/youtube.service.js';
import { uploadImageToS3 } from '../services/uploadToS3.js';
import { isValidEmail, normalizeEmail } from '../utils/emailchecker.js';
import crypto from 'crypto';
import {createClient} from 'redis';

const redisClient = createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('ready', () => console.log('Redis Client Ready'));

export const userProfile = async (req: AuthenticateUserRequest, res: Response): Promise<void> => {
  const { id } = req.user as { id: string };

  const { rows } = await pool.query(
    `
  SELECT
    u.id,
    u.email,
    u.avatar_url,
    gp.name AS github_name
  FROM users u
  LEFT JOIN github_profiles gp
    ON gp.user_id = u.id
  WHERE u.id = $1
  LIMIT 1
  `,
    [id],
  );

  const user = rows[0];

  if (!user) {
    res.status(401).json({ status: false });
    return;
  }
  console.log(user);
  res.status(200).json({
    authenticated: true,
    user,
  });
  return new Promise(() => {});
};
export const repoListController = async (
  req: AuthenticateUserRequest,
  res: Response,
): Promise<void> => {
  const { id } = req.user as { id: string };
  const pageNumber = Number(req.query.page ?? 1);

  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    res.status(400).json({ error: ERROR_CODES.INVALID_PAGE_NUMBER });
    return;
  }

  const { rows } = await pool.query(
    `
    SELECT
      u.id,
      u.avatar_url,
      gp.name AS github_name,
      gp.login,
      oa.access_token
    FROM users u
    LEFT JOIN github_profiles gp
      ON gp.user_id = u.id
    LEFT JOIN oauth_accounts oa
      ON oa.user_id = u.id
     AND oa.provider = 'github'
    WHERE u.id = $1
    LIMIT 1;
    `,
    [id],
  );

  const user = rows[0];

  if (!user) {
    res.status(401).json({ status: false, error: ERROR_CODES.UNAUTHORIZED_ACCESS });
    return;
  }
  console.log(user);

  const access_token = user.access_token;
  const { login, avatar_url } = user;

  if (!access_token) {
    res.status(400).json({ error: ERROR_CODES.GITHUB_NOT_LINKED });
    return;
  }

  const PER_PAGE = 6;

  const githubRes = await axios.get('https://api.github.com/user/repos', {
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    params: {
      per_page: PER_PAGE,
      page: pageNumber,
      sort: 'updated',
      direction: 'desc',
    },
  });

  const repos = githubRes.data.map((repo: any) => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    private: repo.private,
    default_branch: repo.default_branch,
    html_url: repo.html_url,
    updated_at: repo.updated_at,
  }));

  res.json({
    login,
    avatar_url,
    page: pageNumber,
    per_page: PER_PAGE,
    hasNextPage: repos.length === PER_PAGE,
    repos,
  });
};
export const repoPreviewController = async (req: AuthenticateUserRequest, res: Response) => {
  const { owner, repoName } = req.body;
  const { id: userId } = req.user as { id: string };

  if (!owner || !repoName) {
    res.status(400).json({ error: ERROR_CODES.MISSING_REPO_DATA });
    return;
  }
  const { rows } = await pool.query(
    `
    SELECT access_token
    FROM oauth_accounts
    WHERE user_id = $1 AND provider = 'github'
    LIMIT 1
    `,
    [userId],
  );

  const accessToken = rows[0]?.access_token;
  if (!accessToken) {
    res.status(400).json({ error: ERROR_CODES.GITHUB_NOT_LINKED });
    return;
  }

  const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repoName}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  const langRes = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/languages`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  });
  const commitRes = await getLastCommits(accessToken, owner, repoName);
  console.log(commitRes);

  res.json({
    commits: commitRes,
    name: repoRes.data.name,
    full_name: repoRes.data.full_name,
    private: repoRes.data.private,
    default_branch: repoRes.data.default_branch,
    stars: repoRes.data.stargazers_count,
    forks: repoRes.data.forks_count,
    open_issues: repoRes.data.open_issues_count,
    updated_at: repoRes.data.updated_at,
    html_url: repoRes.data.html_url,
    language: repoRes.data.language,
    languages: langRes.data,
    branch: repoRes.data.default_branch,
  });
};
export const externalUrlController = AsyncHandler(
  async (req: AuthenticateUserRequest, res: Response): Promise<void> => {
    const { githubUrl } = req.body;

    if (!githubUrl) {
      res.status(400).json({ error: ERROR_CODES.MISSING_REPO_DATA });
      return;
    }

    console.log(githubUrl);

    res.json({ status: true });
  },
);
export const importRepoController = async (req: AuthenticateUserRequest, res: Response) => {
  const { owner, repoName } = req.body;
  const { id: userId } = req.user as { id: string };
  const random = Math.random().toString(36).substring(2, 8);
  const projectname = `${repoName}-${random}`;

  if (!owner || !repoName) {
    res.status(400).json({ error: ERROR_CODES.MISSING_REPO_DATA });
    return;
  }
  const { rows } = await pool.query(
    `
    SELECT access_token
    FROM oauth_accounts
    WHERE user_id = $1 AND provider = 'github'
    LIMIT 1
    `,
    [userId],
  );

  const accessToken = rows[0]?.access_token;
  if (!accessToken) {
    res.status(400).json({ error: ERROR_CODES.GITHUB_NOT_LINKED });
    return;
  }
  let path = '';

  const dirs = await getAllRepoDirectories(accessToken, owner, repoName, path);
  console.log(dirs);
  res.json({
    status: true,
    projectname,
    directories: dirs,
  });
};
export const frameworkDetectController = async (req: AuthenticateUserRequest, res: Response) => {
  const { owner, repoName, rootDirectory } = req.body;
  console.log(owner, repoName, rootDirectory);
  const { id: userId } = req.user as { id: string };

  if (!owner || !repoName) {
    res.status(400).json({ error: ERROR_CODES.MISSING_REPO_DATA });
    return;
  }
  const { rows } = await pool.query(
    `
    SELECT access_token
    FROM oauth_accounts
    WHERE user_id = $1 AND provider = 'github'
    LIMIT 1
    `,
    [userId],
  );

  const accessToken = rows[0]?.access_token;
  if (!accessToken) {
    res.status(400).json({ error: ERROR_CODES.GITHUB_NOT_LINKED });
    return;
  }
  const files = await getRepoDirectoryContents(accessToken, owner, repoName, rootDirectory);
  const response = await detectFrontendFramework(files);
  console.log(response);
  res.json({
    status: true,
    response,
  });
};
export const deployProjectController = async (req: DeployData, res: Response) => {
  const { id: userId } = req.user as { id: string };
  const data = req.body as DeployData;

  const { owner, repoName, rootDirectory, framework, projectname } = data.deploy;

  const projectRes = await pool.query(
    `
    SELECT id, projectname
    FROM projects
    WHERE user_id = $1::uuid
      AND projectname = $2
    `,
    [userId, projectname],
  );

  let projectId: string;
  let projectName: string;

  // 2. Create project if not exists
  if (projectRes.rowCount === 0) {
    const insertRes = await pool.query(
      `
      INSERT INTO projects
        (user_id, repo_owner, repo_name, root_dir, framework, projectname)
      VALUES ($1::uuid, $2, $3, $4, $5, $6)
      RETURNING id, projectname
      `,
      [userId, owner, repoName, rootDirectory, framework, projectname],
    );

    projectId = insertRes.rows[0].id;
    projectName = insertRes.rows[0].projectname;
  } else {
    projectId = projectRes.rows[0].id;
    projectName = projectRes.rows[0].projectname;

    await pool.query(
      `
      UPDATE projects
      SET root_dir = $1,
          framework = $2
      WHERE id = $3::uuid
      `,
      [rootDirectory, framework, projectId],
    );
  }

  const deploymentRes = await pool.query(
    `
    INSERT INTO deployments
      (
        project_id,
        status,
        install_command,
        build_command,
        output_dir,
        envs,
        user_id
      )
    VALUES
      ($1::uuid, 'QUEUED', $2, $3, $4, $5, $6::uuid)
    RETURNING id
    `,
    [
      projectId,
      data.deploy.installCommand,
      data.deploy.buildCommand,
      data.deploy.outputDir,
      data.deploy.envs,
      userId,
    ],
  );

  const deploymentId = deploymentRes.rows[0].id;

  await enqueueEvent(deploymentId);

  res.json({
    status: true,
    deploymentId,
    projectname: projectName,
  });
};
export const repoInnerDirectoriesController = async (
  req: AuthenticateUserRequest,
  res: Response,
) => {
  const { owner, repoName, path } = req.body;
  const { id: userId } = req.user as { id: string };

  if (!owner || !repoName) {
    res.status(400).json({ error: ERROR_CODES.MISSING_REPO_DATA });
    return;
  }
  const { rows } = await pool.query(
    `
    SELECT access_token
    FROM oauth_accounts
    WHERE user_id = $1 AND provider = 'github'
    LIMIT 1
    `,
    [userId],
  );

  const accessToken = rows[0]?.access_token;
  if (!accessToken) {
    res.status(400).json({ error: ERROR_CODES.GITHUB_NOT_LINKED });
    return;
  }

  const directories = await getAllRepoDirectories(accessToken, owner, repoName, path || '');

  res.json({
    status: true,
    directories,
  });
};
export const deployDashboard = async (req: Request, res: Response): Promise<void> => {
  const { deploymentId } = req.body;
  const { rows } = await pool.query(
    `
   SELECT
  d.id,
  d.status,
  d.started_at,
  d.finished_at,
  p.repo_owner,
  p.repo_name,
  p.root_dir,
  p.framework,
  p.user_id,
  u.avatar_url,
  gp.login
FROM deployments d
JOIN projects p
  ON p.id = d.project_id
JOIN users u
  ON u.id = p.user_id
JOIN github_profiles gp
  ON gp.user_id = u.id
WHERE d.id = $1
LIMIT 1;
    `,
    [deploymentId],
  );
  const deployment = rows[0];
  console.log(deployment);
  res.json({
    status: true,
    deployment,
  });
};
export const projectDashboard = AsyncHandler(
  async (req: AuthenticateUserRequest, res: Response): Promise<void> => {
    const { id } = req.user as { id: string };
    const { rows } = await pool.query(
      `
 SELECT
  u.id              AS user_id,
  u.email,
  u.avatar_url,
  gp.name           AS github_name,

  p.id              AS project_id,
  p.projectname,
  p.repo_name,
  p.repo_owner,

  d.id              AS deployment_id,
  d.status,
  d.created_at      AS deployment_created_at
FROM users u
LEFT JOIN github_profiles gp
  ON gp.user_id = u.id
LEFT JOIN projects p
  ON p.user_id = u.id
LEFT JOIN deployments d
  ON d.project_id = p.id
WHERE u.id = $1::uuid
ORDER BY d.created_at DESC;
  `,
      [id],
    );
    const dashboardData = rows;
    console.log(dashboardData);
    res.json({
      status: true,
      dashboardData,
    });
  },
);
export const userProfileYT = AsyncHandler(
  async (req: AuthenticateUserRequest, res: Response): Promise<void> => {
    const { id: userId } = req.user as { id: string };
    const { rows } = await pool.query(
      `
  SELECT
    u.id,
    u.email,
    oa.id AS oauth_id,
    oa.access_token,
    oa.refresh_token,
    oa.access_token_expires_at
  FROM users u
  LEFT JOIN oauth_accounts oa
    ON oa.user_id = u.id AND oa.provider = 'google'
  WHERE u.id = $1
  LIMIT 1
  `,
      [userId],
    );
    const oauthAccount = rows[0];
    console.log(oauthAccount);

    if (!oauthAccount) {
      res.status(401).json({ status: false });
      return;
    }
    // Map alias to id for the service
    oauthAccount.id = oauthAccount.oauth_id;

    const access_token = oauthAccount.access_token;

    if (!access_token) {
      res.status(401).json({
        status: false,
        error: 'No access token found. Please reconnect your YouTube account.',
      });
      return;
    }

    if (!oauthAccount.refresh_token) {
      console.error('Missing refresh_token for user', userId);
      res.status(401).json({
        status: false,
        error: 'No refresh token found. Please reconnect your YouTube account.',
      });
      return;
    }

    let channelData;
    try {
      const access_token = await getValidGoogleAccessToken(oauthAccount);
      channelData = await fetchMyChannelDetails(access_token);
    } catch (error: any) {
      console.error('Error in userProfileYT:', error.response?.data || error);
      res.status(401).json({
        status: false,
        error:
          'Failed to fetch YouTube channel details. The access token may be expired. Please reconnect your YouTube account.',
        details: error.response?.data || error.message,
      });
      return;
    }

    const responsePayload = {
      email: oauthAccount.email,
      success: true,
      message: 'YouTube account connected successfully',
      channel: {
        id: channelData.id,
        title: channelData.snippet.title,
        description: channelData.snippet.description,
        thumbnails: channelData.snippet.thumbnails,
        stats: {
          subscribers: channelData.statistics.subscriberCount,
          totalViews: channelData.statistics.viewCount,
          videoCount: channelData.statistics.videoCount,
        },
        uploadsPlaylistId: channelData.contentDetails.relatedPlaylists.uploads,
      },
    };
    res.json({
      authenticated: true,
      responsePayload,
    });
    return new Promise(() => {});
  },
);
export const createNewPipeline = AsyncHandler(
  async (req: AuthenticateUserRequest, res: Response): Promise<void> => {
    const { id: adminId } = req.user as { id: string };
    const {
      pipelineName: name,
      color,
      pipelineType,
      executionMode,
      sourceType,
      sourceConfig,
      connectedChannelId,
      defaultPrivacy,
      category,
      madeForKids,
      titleTemplate,
      descriptionTemplate,
      tagsTemplate,
      language,
      region,
      thumbnailMode,
      thumbnailTemplateId,
      timezone,
      scheduleFrequency,
      cronExpression,
      intervalMinutes,
      startAt,
      endAt,
    } = req.body;
    const image = req.file;
    if (!image) {
      throw new Error(ERROR_CODES.IMAGE_REQUIRED);
    }
    const imageUrl = await uploadImageToS3(image, adminId);

    const { rows } = await pool.query(
      `
      SELECT u.id ,
      oa.id AS "oauthId"
      FROM users u
      JOIN oauth_accounts oa
      ON oa.user_id = u.id
      WHERE u.id = $1
      AND oa.provider = 'google'
      LIMIT 1
      `,
      [adminId],
    );
    const oauthId = rows[0]?.oauthId;
    const response = await pool.query(
      `
      SELECT name FROM pipelines WHERE owner_user_id = $1
      `,
      [adminId],
    );

    let scheduleConfig: ScheduleConfig | null = null;

    if (executionMode === 'scheduled') {
      scheduleConfig = {
        timezone,
        frequency: scheduleFrequency,
        cronExpression,
        intervalMinutes,
        startAt,
        endAt,
      };
    }
    const pipelineName = response.rows.find((row: any) => row.name === name);
    if (pipelineName) {
      res.status(400).json({
        status: false,
        message: ERROR_CODES.PIPELINE_ALREADY_EXISTS,
      });
      return;
    }
    const ContentSourceConfig: ContentSourceConfig = {
      type: sourceType,
      config: sourceConfig,
    };
    const YouTubeConfig: YouTubeConfig = {
      channelId: connectedChannelId,
      oauthConnectionId: oauthId,
      defaultPrivacy: defaultPrivacy,
      categoryId: category,
      madeForKids: madeForKids,
    };
    const MetadataStrategy: MetadataStrategy = {
      titleTemplate,
      descriptionTemplate,
      tagsTemplate,
      language,
      region,
    };
    const ScheduleConfig: ScheduleConfig = {
      timezone,
      frequency: scheduleFrequency,
      cronExpression,
      intervalMinutes,
      startAt,
      endAt,
    };
    const ThumbnailConfig: ThumbnailConfig = {
      templateId: thumbnailTemplateId,
      mode: thumbnailMode,
    };
    await pool.query('BEGIN');
    try {
      const result = await pool.query(
        `
      INSERT INTO pipelines (name , owner_user_id , pipeline_type , execution_mode ,content_source , youtube_config , metadata_strategy , thumbnail_config ,schedule_config,color , image_url)
      VALUES ($1 , $2 , $3 , $4 , $5 , $6 , $7 :: jsonb , $8 , $9 , $10 , $11)
      RETURNING id`,
        [
          name,
          adminId,
          pipelineType,
          executionMode,
          ContentSourceConfig,
          YouTubeConfig,
          MetadataStrategy,
          ThumbnailConfig,
          ScheduleConfig,
          color,
          imageUrl.url,
        ],
      );
      const pipelineId = result.rows[0].id;
      await pool.query(
        `
      INSERT INTO pipeline_members
      (pipeline_id , user_id , role , added_by )
      VALUES ($1 , $2 , 'OWNER' , NULL)
      `,
        [pipelineId, adminId],
      );
      await pool.query('COMMIT');
    } catch (error) {
      console.error(error);
      await pool.query('ROLLBACK');
    }
    res.json({
      status: true,
      message: 'pipeline created',
    });
  },
);
export const userPipelines = AsyncHandler(
  async (req: AuthenticateUserRequest, res: Response): Promise<void> => {
    const { id: userId } = req.user as { id: string };
    const { rows } = await pool.query(
      `
      SELECT * FROM pipelines
      WHERE owner_user_id = $1 AND
      deleted_at IS NULL
      ORDER BY created_at DESC;
      `,
      [userId],
    );
    const pipelines = rows;
    console.log(pipelines);
    res.json({
      status: true,
      pipelines,
    });
    return new Promise(() => {});
  },
);
export const getPipelineByName = AsyncHandler(
  async (req: AuthenticateUserRequest, res: Response): Promise<void> => {
    const { id: userId } = req.user as { id: string };
    const { name } = req.params as { name: string };

    const { rows } = await pool.query(
      `
      SELECT
        id,
        name,
        image_url,
        owner_user_id,
        pipeline_type,
        execution_mode,
        content_source,
        youtube_config,
        metadata_strategy,
        thumbnail_config,
        schedule_config,
        approval_flow,
        admin_settings,
        status,
        color,
        created_at,
        updated_at,
        events_integrations
      FROM pipelines
      WHERE name = $1
      AND owner_user_id = $2 AND
      deleted_at IS NULL
      LIMIT 1
      `,
      [name, userId],
    );

    const row = rows[0];

    if (!row) {
      res.status(404).json({
        status: false,
        message: 'Pipeline not found',
      });
      return;
    }

    const isScheduled = row.execution_mode === 'scheduled';
    const scheduleConfig = isScheduled ? row.schedule_config : null;

    const orderedPipelineResponse = {
      header: {
        id: row.id,
        name: row.name,
        status: row.status,
        pipelineType: row.pipeline_type,
        executionMode: row.execution_mode,
        color: row.color,
        image: row.image_url,
      },

      readiness: {
        sourceConfigured: !!row.content_source,
        youtubeConnected: !!row.youtube_config?.oauthConnectionId,
        scheduleConfigured: isScheduled && !!row.schedule_config,
        adminLimitsApplied: !!row.admin_settings,
        verified: row.status === 'VERIFIED',
      },

      configuration: {
        contentSource: row.content_source.type,
        sourceConfig: row.content_source.config,

        approvalFlow: {
          enabled: row.approval_flow?.enabled ?? false,
          stage: row.approval_flow?.stage ?? null,
        },

        youtube: {
          channelId: row.youtube_config.channelId,
          category: row.youtube_config.categoryId,
          privacy: row.youtube_config.defaultPrivacy,
          madeForKids: row.youtube_config.madeForKids,
        },

        metadata: {
          language: row.metadata_strategy.language,
          region: row.metadata_strategy.region,
          titleTemplate: row.metadata_strategy.titleTemplate,
          descriptionTemplate: row.metadata_strategy.descriptionTemplate,
          tagsTemplate: row.metadata_strategy.tagsTemplate,
        },

        thumbnail: {
          mode: row.thumbnail_config.mode,
          templateId: row.thumbnail_config.templateId ?? null,
        },

        schedule: isScheduled
          ? {
              frequency: scheduleConfig.frequency,
              timezone: scheduleConfig.timezone,
              cronExpression: scheduleConfig.cronExpression ?? null,
              intervalMinutes: scheduleConfig.intervalMinutes ?? null,
              startAt: scheduleConfig.startAt ?? null,
              endAt: scheduleConfig.endAt ?? null,
            }
          : null,
      },

      adminLimits: {
        execution: {
          maxConcurrentRuns: row.admin_settings.maxConcurrentRuns,
          retryCount: row.admin_settings.retryCount,
          timeoutPerStepSeconds: row.admin_settings.timeoutPerStepSeconds,
        },
        resources: {
          cpu: row.admin_settings.cpuLimit,
          memoryMB: row.admin_settings.memoryLimitMB,
          storageMB: row.admin_settings.storageQuotaMB,
          dailyUploads: row.admin_settings.dailyUploadQuota,
        },
        safety: {
          onFailureAction: row.admin_settings.onFailureAction,
          autoDisableAfterFailures: row.admin_settings.autoDisableAfterFailures,
          auditTrailEnabled: row.admin_settings.auditTrailEnabled,
          locked: row.admin_settings.lockCriticalSettings,
        },
        integrations: {
          behavior: {
            nonBlocking: row.events_integrations?.behavior?.nonBlocking ?? true,
          },
          webhooks: {
            onSuccess: {
              enabled: row.events_integrations?.webhooks?.onSuccess?.enabled ?? false,
              url: row.events_integrations?.webhooks?.onSuccess?.url ?? null,
              timeoutSeconds: row.events_integrations?.webhooks?.onSuccess?.timeoutSeconds ?? 5,
            },
            onFailure: {
              enabled: row.events_integrations?.webhooks?.onFailure?.enabled ?? false,
              url: row.events_integrations?.webhooks?.onFailure?.url ?? null,
              timeoutSeconds: row.events_integrations?.webhooks?.onFailure?.timeoutSeconds ?? 5,
            },
          },
          alerts: {
            slack: {
              enabled: row.events_integrations?.alerts?.slack?.enabled ?? false,
              webhookUrl: row.events_integrations?.alerts?.slack?.webhookUrl ?? null,
            },
            discord: {
              enabled: row.events_integrations?.alerts?.discord?.enabled ?? false,
              webhookUrl: row.events_integrations?.alerts?.discord?.webhookUrl ?? null,
            },
          },
        },
      },

      metadata: {
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        ownerUserId: row.owner_user_id,
      },
    };

    res.json({
      status: true,
      pipeline: orderedPipelineResponse,
    });
  },
);
export const editConfig = AsyncHandler(
  async (req: AuthenticateUserRequest, res: Response): Promise<void> => {
    const { id: adminId } = req.user as { id: string };

    const {
      pipelineName: name,
      color,
      pipelineType,
      executionMode,
      sourceType,
      sourceConfig,
      connectedChannelId,
      defaultPrivacy,
      category,
      madeForKids,
      titleTemplate,
      descriptionTemplate,
      tagsTemplate,
      language,
      region,
      thumbnailMode,
      thumbnailTemplateId,
      timezone,
      scheduleFrequency,
      cronExpression,
      intervalMinutes,
      startAt,
      endAt,
    } = req.body;
    console.log(req.body);

    const image = req.file as Express.Multer.File | undefined;

    const { rows } = await pool.query(
      `
      SELECT oa.id AS "oauthId"
      FROM oauth_accounts oa
      WHERE oa.user_id = $1
        AND oa.provider = 'google'
      LIMIT 1
      `,
      [adminId],
    );

    const oauthId = rows[0]?.oauthId;

    if (!oauthId) {
      res.status(400).json({
        status: false,
        message: 'Google account not connected',
      });
      return;
    }

    let imageUrl: string | null = null;

    if (image) {
      const uploaded = await uploadImageToS3(image, adminId);
      imageUrl = uploaded.url;
    }

    const contentSourceConfig: ContentSourceConfig = {
      type: sourceType,
      config: sourceConfig,
    };

    const youTubeConfig: YouTubeConfig = {
      channelId: connectedChannelId,
      oauthConnectionId: oauthId,
      defaultPrivacy,
      categoryId: category,
      madeForKids,
    };

    const metadataStrategy: MetadataStrategy = {
      titleTemplate,
      descriptionTemplate,
      tagsTemplate,
      language,
      region,
    };

    let scheduleConfig: ScheduleConfig | null = null;

    if (executionMode === 'scheduled') {
      scheduleConfig = {
        timezone,
        frequency: scheduleFrequency,
        cronExpression,
        intervalMinutes,
        startAt,
        endAt,
      };
    }

    const thumbnailConfig: ThumbnailConfig = {
      templateId: thumbnailTemplateId,
      mode: thumbnailMode,
    };

    const { rowCount } = await pool.query(
      `
      UPDATE pipelines
      SET
        pipeline_type      = $1,
        execution_mode     = $2,
        content_source     = $3::jsonb,
        youtube_config     = $4::jsonb,
        metadata_strategy  = $5::jsonb,
        thumbnail_config   = $6::jsonb,
        schedule_config    = $7::jsonb,
        color              = $8,
        image_url          = COALESCE($9, image_url),
        updated_at         = NOW()
      WHERE name = $10
        AND owner_user_id = $11
      `,
      [
        pipelineType,
        executionMode,
        contentSourceConfig,
        youTubeConfig,
        metadataStrategy,
        thumbnailConfig,
        scheduleConfig,
        color,
        imageUrl,
        name,
        adminId,
      ],
    );

    if (rowCount === 0) {
      res.status(404).json({
        status: false,
        message: 'Pipeline not found',
      });
      return new Promise(() => {});
    }
    res.json({
      status: true,
      message: 'Configuration updated successfully',
    });
  },
);
export const deletePipelineByName = AsyncHandler(
  async (req: AuthenticateUserRequest, res: Response): Promise<void> => {
    const { id: userId } = req.user as { id: string };
    const { name } = req.params as { name: string };

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { rowCount } = await client.query(
        `
        UPDATE pipelines
        SET deleted_at = now()
        WHERE name = $1
          AND owner_user_id = $2
          AND deleted_at IS NULL
        `,
        [name, userId],
      );

      if (rowCount === 0) {
        throw new Error('Pipeline not found or already deleted');
      }
      await client.query(
        `
        UPDATE pipeline_members
        SET deleted_at = now()
        WHERE pipeline_id = (
          SELECT id FROM pipelines
          WHERE name = $1 AND owner_user_id = $2
        )
        `,
        [name, userId],
      );

      await client.query('COMMIT');

      res.json({
        status: true,
        message: 'Pipeline moved to trash',
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
);
export const configAdavancedSettingsByName = AsyncHandler(
  async (req: AuthenticateUserRequest, res: Response): Promise<void> => {
    const { id: userId } = req.user as { id: string };
    const { name } = req.params as { name: string };
    const { approvalFlow, adminSettings, integrations } = req.body;
    await pool.query(
      `
    UPDATE pipelines
    SET approval_flow = $1::jsonb,
    admin_settings = $2::jsonb,
    events_integrations = $3::jsonb
    WHERE name = $4
      AND owner_user_id = $5
    `,
      [approvalFlow, adminSettings, integrations, name, userId],
    );
    res.json({
      status: true,
      message: 'Approval flow updated successfully',
    });
    return new Promise(() => {});
  },
);
export const trashController = AsyncHandler(
  async (req: AuthenticateUserRequest, res: Response): Promise<void> => {
    const { id: userId } = req.user as { id: string };
    const { name, event } = req.body as {
      name?: string;
      event?: 'restore' | 'delete' | 'count' | 'visit';
    };
    if (event === 'visit') {
      const { rows } = await pool.query(
        `
        SELECT id, name, deleted_at
        FROM pipelines
        WHERE owner_user_id = $1
          AND deleted_at IS NOT NULL
        ORDER BY deleted_at DESC
        `,
        [userId],
      );

      res.json({
        status: true,
        trashedPipelines: rows,
      });
      return;
    }

    if (event === 'count') {
      const { rows } = await pool.query(
        `
        SELECT COUNT(*)::int AS count
        FROM pipelines
        WHERE owner_user_id = $1
          AND deleted_at IS NOT NULL
        `,
        [userId],
      );

      res.json({
        status: true,
        count: rows[0].count,
      });
      return;
    }

    if (!name || !event) {
      res.status(400).json({
        status: false,
        message: 'name and event are required',
      });
      return;
    }
    if (event === 'restore') {
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        await client.query(
          `
          UPDATE pipelines
          SET deleted_at = NULL
          WHERE name = $1
            AND owner_user_id = $2
          `,
          [name, userId],
        );

        await client.query(
          `
          UPDATE pipeline_members
          SET deleted_at = NULL
          WHERE pipeline_id = (
            SELECT id FROM pipelines
            WHERE name = $1 AND owner_user_id = $2
          )
          `,
          [name, userId],
        );

        await client.query('COMMIT');

        res.json({
          status: true,
          message: ERROR_CODES.PIPELINE_RESTORED_SUCCESSFULLY,
        });
        return;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }
    if (event === 'delete') {
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        await client.query(
          `
          DELETE FROM pipeline_members
          WHERE pipeline_id = (
            SELECT id FROM pipelines
            WHERE name = $1
              AND owner_user_id = $2
              AND deleted_at IS NOT NULL
          )
          `,
          [name, userId],
        );

        await client.query(
          `
          DELETE FROM pipelines
          WHERE name = $1
            AND owner_user_id = $2
            AND deleted_at IS NOT NULL
          `,
          [name, userId],
        );

        await client.query('COMMIT');

        res.json({
          status: true,
          message: ERROR_CODES.PIPELINE_PERMANENTLY_DELETED,
        });
        return;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    res.status(400).json({
      status: false,
      message: ERROR_CODES.INVALID_EVENT_TYPE,
    });
  },
);
export const startAutomationController = AsyncHandler(
  async (req: AuthenticateUserRequest, res: Response): Promise<void> => {
    function validateStartAutomation(pipeline: any): AutomationValidationResult {
      const errors: string[] = [];

      if (!['CREATED', 'PAUSED'].includes(pipeline.status)) {
        errors.push(`Pipeline cannot be started from status "${pipeline.status}".`);
      }

      if (pipeline.execution_mode !== 'scheduled') {
        errors.push('Pipeline execution mode must be "schedule" to start automation.');
      }

      const schedule = pipeline.schedule_config;
      if (!schedule) {
        errors.push('Schedule configuration is missing.');
      }

      if (schedule) {
        if (!schedule.timezone) {
          errors.push('Schedule timezone is required.');
        }

        if (!['cron', 'interval'].includes(schedule.frequency)) {
          errors.push('Schedule frequency must be either "cron" or "interval".');
        }

        if (schedule.frequency === 'cron') {
          if (!schedule.cronExpression) {
            errors.push('Cron expression is required for cron schedules.');
          }
        }

        if (schedule.frequency === 'interval') {
          if (typeof schedule.intervalMinutes !== 'number' || schedule.intervalMinutes <= 0) {
            errors.push('Interval minutes must be a number greater than 0.');
          }
        }

        if (schedule.startAt && schedule.endAt) {
          if (new Date(schedule.startAt) >= new Date(schedule.endAt)) {
            errors.push('Schedule start time must be before end time.');
          }
        }
      }

      const yt = pipeline.youtube_config;
      if (!yt) {
        errors.push('YouTube configuration is missing.');
      } else {
        if (!yt.channelId) {
          errors.push('YouTube channel is not selected.');
        }
        if (!yt.oauthConnectionId) {
          errors.push('YouTube OAuth connection is missing.');
        }
      }
      const source = pipeline.content_source;
      if (!source || !source.type) {
        errors.push('Content source is not configured.');
      }
      const admin = pipeline.admin_settings;
      if (!admin) {
        errors.push('Admin limits are not configured.');
      } else {
        if (admin.maxConcurrentRuns < 1) {
          errors.push('Max concurrent runs must be at least 1.');
        }
        if (admin.timeoutPerStepSeconds <= 0) {
          errors.push('Timeout per step must be greater than 0.');
        }
      }

      return {
        ok: errors.length === 0,
        errors,
      };
    }
    const { id: userId } = req.user as { id: string };
    const { name } = req.params as { name: string };

    const { rows } = await pool.query(
      `
      SELECT *
      FROM pipelines
      WHERE name = $1
        AND owner_user_id = $2
      LIMIT 1
      `,
      [name, userId],
    );

    const pipeline = rows[0];

    if (!pipeline) {
      res.status(404).json({
        status: false,
        message: 'Pipeline not found',
      });
      return;
    }

    const validation = validateStartAutomation(pipeline);

    if (!validation.ok) {
      res.status(422).json({
        status: false,
        message: 'Pipeline is not ready for automation.',
        reasons: validation.errors,
      });
      return;
    }

    const { rows: updatedRows } = await pool.query(
      `
      UPDATE pipelines
      SET
        status = 'ACTIVE',
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, status, execution_mode
      `,
      [pipeline.id],
    );

    const updated = updatedRows[0];

    res.json({
      status: true,
      message: 'Automation started successfully.',
      pipeline: {
        id: updated.id,
        name: updated.name,
        status: updated.status,
        executionMode: updated.execution_mode,
      },
    });
  },
);
export const countThePipelines = AsyncHandler(
  async (req: AuthenticateUserRequest, res: Response): Promise<void> => {
    const { id: userId } = req.user as { id: string };
    const { rows } = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM pipelines
      WHERE owner_user_id = $1
      `,
      [userId],
    );
    console.log();
    res.json({
      status: true,
      count: rows[0].count,
    });
    return new Promise(() => {});
  },
);
export const getMembersBypipeline = AsyncHandler(
  async (req: AuthenticateUserRequest, res: Response): Promise<void> => {
    const { id: userId } = req.user as { id: string };
    const { name } = req.params as { name: string };
    const { rows } = await pool.query(
      `
    SELECT id FROM pipelines
    WHERE name = $1
      AND owner_user_id = $2
    LIMIT 1
    `,
      [name, userId],
    );
    const pipelineId = rows[0]?.id;
    if (!pipelineId) {
      res.json({
        status: false,
        message: ERROR_CODES.PIPELINE_NOT_FOUND,
      });
    }
    const { rows: members } = await pool.query(
      `
    SELECT
      user_id , role FROM pipeline_members
    WHERE pipeline_id = $1
    `,
      [pipelineId],
    );
    const emails = [];
    for (const member of members) {
      const { rows } = await pool.query(
        `
      SELECT email
      FROM users
      WHERE id = $1
      `,
        [member.user_id],
      );
      emails.push({ email: rows[0].email, role: member.role });
    }
    res.json({
      status: true,
      emails,
    });
    return new Promise(() => {});
  },
);
export const inviteMembersToPipeline = AsyncHandler(
  async (req: AuthenticateUserRequest, res: Response) => {
    await redisClient.connect();
    const { id: userId } = req.user as { id: string };
    const { name } = req.params as { name: string };
    let { email, role } = req.body as { email: string; role: string };

    email = normalizeEmail(email);

    if (!isValidEmail(email)) {
      return res.status(400).json({
        status: false,
        message: ERROR_CODES.INVALID_EMAIL,
      });
    }

    const allowedRoles = ['EDITOR', 'VIEWER', 'REVIEWER'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        status: false,
        message: ERROR_CODES.INVALID_ROLE,
      });
    }

    const { rows: pipelineRows } = await pool.query(
      `
      SELECT id
      FROM pipelines
      WHERE name = $1
        AND owner_user_id = $2
        AND deleted_at IS NULL
      LIMIT 1
      `,
      [name, userId],
    );

    const pipelineId = pipelineRows[0]?.id;
    if (!pipelineId) {
      return res.status(403).json({
        status: false,
        message: ERROR_CODES.PIPELINE_NOT_FOUND_OR_NO_PERMISSION,
      });
    }

    const { rows: userRows } = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [email],
    );

    const invitedUserId = userRows[0]?.id;

    if (invitedUserId) {
      const { rowCount } = await pool.query(
        `
        SELECT 1
        FROM pipeline_members
        WHERE pipeline_id = $1
          AND user_id = $2
          AND deleted_at IS NULL
        `,
        [pipelineId, invitedUserId],
      );
      //@ts-ignore
      if (rowCount > 0) {
        return res.status(409).json({
          status: false,
          message: ERROR_CODES.USER_ALREADY_AN_ACTIVEMEMBER_IN_THIS_PIPELINE,
        });
      }
    }

    const { rowCount: inviteExists } = await pool.query(
      `
      SELECT 1
      FROM pipeline_invites
      WHERE pipeline_id = $1
        AND email = $2
        AND status = 'PENDING'
        AND expires_at > now()
      `,
      [pipelineId, email],
    );

    //@ts-ignore
    if (inviteExists > 0) {
      return res.status(409).json({
        status: false,
        message: ERROR_CODES.INVITE_ALREADY_SENT,
      });
    }
    const token = crypto.randomUUID();
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    await pool.query(
      `
      INSERT INTO pipeline_invites (
        pipeline_id,
        email,
        role,
        invited_by,
        token,
        expires_at
      )
      VALUES ($1, $2, $3, $4, $5, now() + interval '48 hours')
      `,
      [pipelineId, email, role, userId, hashedToken],
    );
   await redisClient.hSet(`invite`, {Email : email , Token : token});


    return res.json({
      status: true,
      message: ERROR_CODES.INVITE_SENT_SUCCESSFULLY,
    });
  },
);
