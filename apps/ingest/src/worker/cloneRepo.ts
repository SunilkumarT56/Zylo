import { simpleGit } from "simple-git";
import fs from "fs";
import path from "path";

export async function cloneRepo(
  repoUrl: string,
  targetDir: string,
  subDir?: string
) {
  const git = simpleGit();

  if (!subDir || subDir === "/" || subDir === "") {
    await git.clone(repoUrl, targetDir);
    return;
  }

  await git.clone(repoUrl, targetDir, ["--no-checkout"]);

  const repoGit = simpleGit(targetDir);
  await repoGit.raw(["sparse-checkout", "init", "--cone"]);
  await repoGit.raw(["sparse-checkout", "set", subDir]);
  await repoGit.checkout();

  flattenSubDir(targetDir, subDir);
}
function flattenSubDir(targetDir: string, subDir: string) {
  const sourcePath = path.join(targetDir, subDir);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`SubDir ${subDir} not found after clone`);
  }

  for (const item of fs.readdirSync(sourcePath)) {
    const src = path.join(sourcePath, item);
    const dest = path.join(targetDir, item);

    if (item === ".git") continue;

    fs.renameSync(src, dest);
  }

  const topFolder = subDir.split("/")[0];
  if (topFolder) {
    fs.rmSync(path.join(targetDir, topFolder), {
      recursive: true,
      force: true,
    });
  }
}
