import type { Request, Response } from 'express';
import type { AuthenticateUserRequest, DeployData } from '@zylo/types';
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
  res.json({
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
