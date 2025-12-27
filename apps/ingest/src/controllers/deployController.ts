import { v4 as uuid } from "uuid";
import { simpleGit } from "simple-git";
import path from "path";
import { fileURLToPath } from "url";
import { getAllFiles } from "../utils/file.js";
import { uploadFile } from "../s3/uploadToS3.js";
import { createClient } from "redis";
import type { Request, Response } from "express";
import { clearBuildFolders } from "../utils/clearFolder.js";
import { Redis } from "ioredis";
import fs from "fs";
import { cloneRepo } from "../worker/cloneRepo.js";
import type { RepoData} from "@zylo/types";

const publisher = createClient();
const pub = new Redis();
publisher.connect().catch(console.error);
publisher.on("ready", () => console.log("✅ Redis connected"));
publisher.on("error", (err) => console.error("❌ Redis error:", err));

const git = simpleGit();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const dequeTheProjectById = async (req: Request, res: Response) => {};

export const deployService = async function (RepoData: RepoData) {
  const repo_url = RepoData?.repourl;
  let id = uuid();
  const outputPath = path.join(__dirname, `../../output/${id}`);
  const subDir = RepoData?.subDir;
  pub.publish(`logs:${id}`, `cloning repo ${repo_url}`);
  await cloneRepo(repo_url, outputPath, subDir);
  const files = getAllFiles(path.join(__dirname, `../../output/${id}`));
  const rootDir = path.join(__dirname, "../../");
  const outputDir = path.join(rootDir, "output");
  const currectPath = path.join(__dirname, "../../output");
  pub.publish(`logs:${id}`, `uploading the files`);
  for (const file of files) {
    if (file.includes(".git") || file.includes(".DS_Store")) continue;
    console.log("📤 Uploading:", file);
    await uploadFile("output/" + file.slice(outputDir.length + 1), file);
  }

  console.log("✅ Upload done, pushing status to Redis....", id);
  await publisher.hSet("status", id, "uploading");
  await publisher.lPush("build-queue", id);

  await clearBuildFolders(id);

  const hostsPath = "/etc/hosts";
  const entry = `127.0.0.1   ${id}.sunilkumar.com`;

  const hostsContent = fs.readFileSync(hostsPath, "utf8");
  fs.appendFileSync(hostsPath, `\n${entry}\n`);
  console.log("Entry added");
};
