import { pool } from "../config/postgresql.js";
import { deployService } from "../controllers/deployController.js";
import type { RepoData , DeploymentWithRepo } from "@zylo/types";

export const getDeploymentFromDb = async (
  deploymentId: string
): Promise<void | null> => {
  const { rows } = await pool.query<DeploymentWithRepo>(
    `
    SELECT 
      d.id AS deployment_id,
      d.status,
      d.created_at,
      p.repo_owner,
      p.repo_name,
      p.root_dir
    FROM deployments d
    JOIN projects p ON d.project_id = p.id
    WHERE d.id = $1;
    `,
    [deploymentId]
  );

  if (rows.length === 0) {
    return null;
  }
  const data = rows[0]!;
  const repoUrl = `https://github.com/${rows[0]!.repo_owner}/${
    rows[0]!.repo_name
  }`;
  const Dir = rows[0]!.root_dir
  const RepoData : RepoData = {
    repourl: repoUrl,
    subDir: Dir
  };
  console.log(RepoData)
  await deployService(RepoData);
};
