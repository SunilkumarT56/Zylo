import crypto from "crypto";
import { ApiRouteConfig, Handlers } from "motia";

export const config: ApiRouteConfig = {
  name: "github-oauth-init",
  type: "api",
  method: "GET",
  path: "/auth/github/init",
  emits: [],
};

export const handler = async () => {
  // 1️⃣ Generate CSRF token
  const state = crypto.randomBytes(16).toString("hex");

  // 2️⃣ Redirect to GitHub OAuth
  const githubAuthURL =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&redirect_uri=${process.env.GITHUB_CALLBACK_URL}` +
    `&scope=read:user user:email` +
    `&state=${state}`;

  return {
    status: 302,
    headers: {
      "Set-Cookie": `github_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/`,
      Location: githubAuthURL,
    },
  };
};