import axios from "axios";
import { ApiRouteConfig, FlowContext } from "motia";

type GitHubCallbackRequest = {
  query: { code?: string; state?: string };
  cookies: Record<string, string>;
};
function parseCookies(cookieHeader?: string) {
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce((acc, part) => {
    const [key, value] = part.trim().split("=");
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {} as Record<string, string>);
}

export const config: ApiRouteConfig = {
  name: "github-oauth-callback",
  type: "api",
  method: "GET",
  path: "/auth/github/callback",
  emits: [],
};

export const handler = async (
  req : any,
  { logger }: FlowContext<never>
) => {
  const {code , state }= req.queryParams;
  const cookies = parseCookies(req.headers.cookie);
  const storedState = cookies.github_oauth_state

  // 1️⃣ CSRF validation
  if (!state || !storedState || state !== storedState) {
    return {
      status: 401,
      body: { error: "Invalid OAuth state (CSRF detected)" },
    };
  }

  // 2️⃣ Exchange code → access token
  const tokenRes = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    },
    { headers: { Accept: "application/json" } }
  );

  const accessToken = tokenRes.data.access_token;

  if (!accessToken) {
    return { status: 400, body: { error: "OAuth token exchange failed" } };
  }

  // 3️⃣ Fetch GitHub user
  const userRes = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const emailRes = await axios.get("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const githubUser = userRes.data;
  const primaryEmail = emailRes.data.find((e: any) => e.primary)?.email;

  // 4️⃣ User linking logic (pseudo)
  /*
    IF github_id exists → login
    ELSE IF email exists → link account
    ELSE → create user
  */

  const user = {
    id: githubUser.id,
    email: primaryEmail,
    username: githubUser.login,
  };
  console.log(user)

  // 5️⃣ Issue YOUR token (JWT/session)
  const jwt = "SIGNED_JWT_HERE";

  return {
    status: 302,
    headers: {
      "Set-Cookie": `auth_token=${jwt}; HttpOnly; SameSite=Lax; Path=/`,
      Location: "http://localhost:5173/dashboard",
    },
  };
};