import type { Request } from 'express';

export interface AuthenticateUserRequest extends Request {
  user?: {
    id: string;
    email: string;
    avatar_url?: string;
  };
}
export interface DirNode {
  name: string;
  path: string;
  children?: DirNode[];
  type?: 'file' | 'dir';
}

export interface DeployData extends AuthenticateUserRequest {
  deploy: {
    owner: string;
    repoName: string;
    rootDirectory: string;
    framework: string;
    buildCommand: string;
    outputDir: string;
    installCommand: string;
    envs: string;
    projectname: string;
  };
}

export interface User {
  email: string | null;
  avatar_url: string | null;
  status: 'active' | 'suspended' | 'deleted';
  updated_at: Number;
}

export interface GhData {
  ghUser: {
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
    data: string;
    email: string;
    primary: boolean;
    verified: boolean;
    visibility: string;
  }[];
}
export interface DeploymentWithRepo {
  deployment_id: string;
  status: string;
  created_at: string;
  repo_owner: string;
  repo_name: string;
  root_dir: string;
}
export interface RepoData {
  repourl: string;
  subDir?: string;
}
export type PipelineType = "youtube_long" | "youtube_shorts";
export type ExecutionMode = "manual" | "scheduled";

export interface Pipeline {
  id: string;
  pipelineName: string;
  ownerUserId: string;
  organizationId?: string;

  pipelineType: PipelineType;
  executionMode: ExecutionMode;
  status: "idle" | "disabled";  //after creating the pipeline

  contentSource: ContentSourceConfig;
  youtube: YouTubeConfig;
  metadataStrategy: MetadataStrategy;
  thumbnail: ThumbnailConfig;

  schedule?: ScheduleConfig;

  approvalFlow: ApprovalFlow;
  limits: PipelineLimits;
  events?: PipelineEvents;

  stats: PipelineStats;
  createdAt: string;
  updatedAt: string;
}

export interface ContentSourceConfig {
  type: "upload" | "drive" | "s3" | "git";
  config?: Record<string, any> | null;
}

export interface YouTubeConfig {
  channelId: string;
  oauthConnectionId: string;
  defaultPrivacy: "public" | "unlisted" | "private";
  categoryId: string;
  madeForKids: boolean;
}

export interface MetadataStrategy {
  titleTemplate: string;
  descriptionTemplate: string;
  tagsTemplate?: string;
  language: string;
  region: string;
}

export interface ThumbnailConfig {
  mode: "auto" | "upload" | "template";
  templateId?: string;
}

export interface ScheduleConfig {
  timezone: string;
  frequency: "cron" | "interval";
  cronExpression?: string;
  intervalMinutes?: number;
  startAt?: string;
  endAt?: string;
}

export interface ApprovalFlow {
  enabled: boolean;
  stages?: Array<"Editor" | "Reviewer" | "Admin">;
}

export interface PipelineLimits {
  maxVideosPerRun: number;
  maxDailyUploads: number;
  maxFileSizeMb: number;
}

export interface PipelineEvents {
  webhooks?: {
    onSuccess?: string;
    onFailure?: string;
  };
  alerts?: {
    slackWebhook?: string;
    discordWebhook?: string;
  };
}

export interface PipelineStats {
  runCount: number;
  successCount: number;
  failureCount: number;
  lastRunAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
}
export type ConfigHandler = (
  pipelineId: string,
  userId: string,
  value: any
) => Promise<void>;

interface GitSourceConfig {
  repoUrl: string;
  branch: string;
  path?: string;
}
interface S3SourceConfig {
  bucket: string;
  prefix?: string;
}
interface DriveSourceConfig {
  driveFolderId: string;
}

