export type PipelineType = 'youtube_long' | 'youtube_shorts';
export type ExecutionMode = 'manual' | 'scheduled';
export type SourceType = 'upload' | 'google_drive' | 's3' | 'git';
export type ThumbnailMode = 'auto' | 'upload' | 'template';
export type PrivacyStatus = 'private' | 'unlisted' | 'public';

export interface ChannelStats {
  subscribers: string;
  totalViews: string;
  videoCount: string;
}

export interface ChannelThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface ChannelThumbnails {
  default: ChannelThumbnail;
  medium: ChannelThumbnail;
  high: ChannelThumbnail;
}

export interface ChannelData {
  id: string;
  title: string;
  description: string;
  thumbnails: ChannelThumbnails;
  stats: ChannelStats;
  uploadsPlaylistId: string;
}

export interface PipelineData {
  // Step 1: Identity
  pipelineName: string;

  // Step 2: Type & Mode
  pipelineType: PipelineType;
  executionMode: ExecutionMode;

  // Step 3: Source
  sourceType: SourceType;
  driveFolderId?: string;
  s3Bucket?: string;
  s3Prefix?: string;
  gitRepoUrl?: string;
  gitBranch?: string;
  gitPath?: string;

  // Step 4: YouTube
  connectedChannelId: string;
  defaultPrivacy: PrivacyStatus;
  category: string;
  madeForKids: boolean;

  // Step 5: Metadata & Thumbnail
  titleTemplate: string;
  descriptionTemplate: string;
  tagsTemplate: string;
  language: string;
  region: string;
  thumbnailMode: ThumbnailMode;
  thumbnailTemplateId?: string;

  // Step 6: Scheduling
  timezone: string;
  scheduleFrequency: 'cron' | 'interval';
  cronExpression?: string;
  intervalMinutes?: number;
  startDate?: string;
  endDate?: string;
  color: string;
}

export const INITIAL_DATA: PipelineData = {
  pipelineName: '',
  pipelineType: 'youtube_long',
  executionMode: 'manual',
  sourceType: 'upload',
  connectedChannelId: '',
  defaultPrivacy: 'private',
  category: 'People & Blogs', // People & Blogs default
  madeForKids: false,
  titleTemplate: '',
  descriptionTemplate: '',
  tagsTemplate: '',
  language: 'en',
  region: 'US',
  thumbnailMode: 'auto',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  scheduleFrequency: 'cron',
  color: 'linear-gradient(to right, #4f46e5, #9333ea)', // Default gradient
};

export type WizardStep =
  | 'identity'
  | 'type'
  | 'source'
  | 'youtube'
  | 'metadata'
  | 'scheduling'
  | 'review';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
