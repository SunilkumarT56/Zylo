import type { Request, Response } from "express";
import crypto from "crypto";
import axios from "axios";
import { prisma } from "../config/postgresql.js";
import { generateJWT} from "../utils/jwt.js";
import { ghDataCollector } from "../services/github.service.js";
import { upsertGithubProfile } from "../services/github.service.js";
import { cookieSender } from "../utils/cookies.js";

export const oauthGithubController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const state = crypto.randomBytes(16).toString("hex");
  const githubAuthURL =
    "https://github.com/login/oauth/authorize" +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.GITHUB_CALLBACK_URL!)}` +
    `&scope=read:user user:email repo read:org` +
    `&state=${state}`;

  res.cookie("github_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });

  res.redirect(302, githubAuthURL);
};
export const redirectHandlerGithubController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code, state } = req.query;
    const { github_oauth_state } = req.cookies;

   
    if (!state || state !== github_oauth_state) {
      res.status(401).json({ status: false, error: "Invalid OAuth state" });
      return;
    }


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
      res.status(401).json({ status: false, error: "OAuth failed" });
      return;
    }

    const { ghUser, ghEmails } = await ghDataCollector(accessToken);
    const primaryEmail =
      ghEmails.find((e) => e.primary && e.verified)?.email ?? null;

    const provider = "github";
    const providerUserId = ghUser.id.toString();

    const existingOAuth = await prisma.oauth_accounts.findUnique({
      where: {
        provider_provider_user_id: {
          provider,
          provider_user_id: providerUserId,
        },
      },
      include: {
        user: true,
      },
    });

    let user;

    if (existingOAuth) {
      user = existingOAuth.user;
    } else {
      if (primaryEmail) {
        user = await prisma.users.findUnique({
          where: { email: primaryEmail },
        });
      }

      if (!user) {
        user = await prisma.users.create({
          data: {
            email: primaryEmail,
            avatar_url: ghUser.avatar_url,
          },
        });
      }

      await prisma.oauth_accounts.create({
        data: {
          user_id: user.id,
          provider,
          provider_user_id: providerUserId,
          access_token: accessToken,
          scope: "read:user user:email repo read:org",
        },
      });
    }

    await upsertGithubProfile(user.id, ghUser, ghEmails);

    res.clearCookie("github_oauth_state", { path: "/" });

    const authToken = generateJWT(user.id);
    cookieSender(req, res, "zylo", authToken);

    res.redirect("http://localhost:5173/dashboard");
  } catch (err) {
    console.error("GitHub OAuth error:", err);
    res.status(500).json({ status: false, error: "OAuth login failed" });
  }
};
export const logoutController = async (req: Request, res: Response) => {
  res.clearCookie("auth_token", { path: "/" });
  res.json({ status: true });
};
