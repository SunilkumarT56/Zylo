import type { GhData } from "../types/auth.js";
import axios from "axios";
import {prisma} from "../config/postgresql.js";


const ghClient = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
  },
});

export const ghDataCollector = async (
  accessToken: string
): Promise<GhData> => {
  if (!accessToken) {
    throw new Error("GitHub access token missing");
  }

  const authHeader = {
    Authorization: `Bearer ${accessToken}`,
  };

  const [ghUserRes, ghEmailsRes] = await Promise.all([
    ghClient.get("/user", { headers: authHeader }),
    ghClient.get("/user/emails", { headers: authHeader }),
  ]);

  const ghUser = ghUserRes.data;
  const ghEmails = ghEmailsRes.data;

  return {
    ghUser,
    ghEmails,
  };
};
export const upsertGithubProfile=  async function (
  userId: string,
  ghUser : GhData["ghUser"],
  ghEmails : GhData["ghEmails"]
) {
  await  prisma.github_profiles.upsert({
    where: {
      github_id: ghUser.id,
    },
    update: {
      avatar_url: ghUser.avatar_url,
      name: ghUser.name,
      company: ghUser.company,
      blog: ghUser.blog,
      location: ghUser.location,
      bio: ghUser.bio,
      twitter_username: ghUser.twitter_username,
      public_repos: ghUser.public_repos,
      public_gists: ghUser.public_gists,
      followers: ghUser.followers,
      following: ghUser.following,
      emails: ghEmails,
      updated_at_github: new Date(ghUser.updated_at),
    },
    create: {
      user_id: userId,
      github_id: ghUser.id,
      login: ghUser.login,
      avatar_url: ghUser.avatar_url,
      gravatar_id: ghUser.gravatar_id,
      html_url: ghUser.html_url,
      repos_url: ghUser.repos_url,
      organizations_url: ghUser.organizations_url,
      events_url: ghUser.events_url,
      received_events_url: ghUser.received_events_url,
      name: ghUser.name,
      company: ghUser.company,
      blog: ghUser.blog,
      location: ghUser.location,
      bio: ghUser.bio,
      twitter_username: ghUser.twitter_username,
      hireable: ghUser.hireable,
      site_admin: ghUser.site_admin,
      public_repos: ghUser.public_repos,
      public_gists: ghUser.public_gists,
      followers: ghUser.followers,
      following: ghUser.following,
      created_at_github: new Date(ghUser.created_at),
      updated_at_github: new Date(ghUser.updated_at),
      emails: ghEmails,
    },
  });
}