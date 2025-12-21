export interface User {           
    email: string | null;
    avatar_url: string | null;
    status: "active" | "suspended" | "deleted";
    updated_at: Number;
  }
  export interface GhData {
    ghUser : {
      login: string;
      id: number;
      avatar_url: string;
      gravatar_id: string;
      url: string;
      html_url: string;
      followers_url: string;
      following_url: string;
      gists_url: string;
      starred_url: string;
      subscriptions_url: string;
      organizations_url: string;
      repos_url: string;
      events_url: string;
      received_events_url: string;
      type: string;
      site_admin: boolean;
      name: string;
      company: string;
      blog: string;
      location: string;
      email: string;
      hireable: boolean;
      bio: string;
      twitter_username: string;
      public_repos: number;
      public_gists: number;
      followers: number;
      following: number;
      created_at: string;
      updated_at: string;
    };
    ghEmails: {
      data: string
      email: string;
      primary: boolean;
      verified: boolean;
      visibility: string;
    }[];

  }