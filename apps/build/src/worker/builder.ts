import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import redis from "redis";
import * as tar from "tar";
import { fileURLToPath } from "url";

const publisher = redis.createClient();
await publisher.connect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function buildReactProject(deploymentId: string) {
  const projectPath = path.resolve(__dirname, "../../output", deploymentId);
  const outputPath = path.resolve(
    __dirname,
    "../../builded-folder",
    deploymentId
  );

  // ─────────────────────────────────────────────
  // 1️⃣ Validate input
  // ─────────────────────────────────────────────
  if (!fs.existsSync(projectPath)) {
    throw new Error(`Project path not found: ${projectPath}`);
  }

  if (!fs.existsSync(path.join(projectPath, "package.json"))) {
    await publisher.hSet("status", deploymentId, "failed");
    throw new Error("No package.json found in project");
  }

  fs.mkdirSync(outputPath, { recursive: true });

  console.log(`🚀 Building project ${deploymentId}`);

  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(
        "docker",
        [
          "run",
          "--rm",
          "-v",
          `${projectPath}:/src:ro`,
          "node:20-alpine",
          "sh",
          "-c",
          `
set -euo pipefail

mkdir -p /tmp/workspace /tmp/output /tmp/pnpm-home /tmp/pnpm-store
cp -R /src/. /tmp/workspace/
cd /tmp/workspace

export PNPM_HOME=/tmp/pnpm-home
export PATH="$PNPM_HOME:$PATH"
export PNPM_STORE_DIR=/tmp/pnpm-store
export CI=true

corepack enable
corepack prepare pnpm@8.15.5 --activate

if [ -f pnpm-lock.yaml ]; then
  pnpm install --no-frozen-lockfile >&2
elif [ -f yarn.lock ]; then
  npm install -g yarn >/dev/null 2>&1
  yarn install >&2
else
  npm install --legacy-peer-deps >&2
fi

if grep -q "\\"build\\"" package.json; then
  npm run build >&2
else
  npx vite build >&2
fi

if [ -d dist ]; then
  cp -R dist/. /tmp/output/
elif [ -d build ]; then
  cp -R build/. /tmp/output/
elif [ -d out ]; then
  cp -R out/. /tmp/output/
elif [ -d .next/out ]; then
  cp -R .next/out/. /tmp/output/
else
  echo "❌ No build output directory found" >&2
  exit 1
fi

# 🔥 TAR STREAM OUTPUT
tar -C /tmp/output -cf - .
`,
        ],
        {
          stdio: ["ignore", "pipe", "pipe"],
        }
      );

      // Extract tar stream on host
      const extractor = tar.x({
        cwd: outputPath,
        strip: 0,
      });

      child.stdout.pipe(extractor);

      child.stderr.on("data", (data) => {
        console.error(`[docker] ${data.toString()}`);
      });

      child.on("error", reject);

      child.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Docker exited with code ${code}`));
        }
      });
    });

    await publisher.hSet("status", deploymentId, "builded");
    console.log(`✅ Build completed for ${deploymentId}`);
  } catch (err) {
    console.error(`❌ Build failed for ${deploymentId}`, err);
    await publisher.hSet("status", deploymentId, "failed");
    throw err;
  }
}
