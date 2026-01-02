export const ConfiguredBy = {
  SYSTEM: 'system',
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type ConfiguredBy = (typeof ConfiguredBy)[keyof typeof ConfiguredBy];

export const OnFailureAction = {
  NONE: 'none',
  PAUSE_PIPELINE: 'pause_pipeline',
  RETRY_PIPELINE: 'retry_pipeline',
  DISABLE_PIPELINE: 'disable_pipeline',
  NOTIFY_ONLY: 'notify_only',
} as const;

export type OnFailureAction = (typeof OnFailureAction)[keyof typeof OnFailureAction];

export interface AdvancedSettings {
  approvalFlow: {
    enabled: boolean;
    stages: string[];
  };
  executionLimits: {
    maxConcurrentRuns: number;
    maxDailyUploads: number;
    maxFileSizeMB: number;
    totalStorageMB: number;
    timeoutPerStepSeconds: number;
    autoDisableAfterFailures: number;
    cpuLimit: number;
    retryCount: number;
    configuredBy: ConfiguredBy;
  };
  events: {
    onSuccessWebhook: string;
    onFailureWebhook: string;
    webhookSettings?: {
      timeoutSeconds: number;
      behavior: {
        nonBlocking: boolean;
      };
    };
    alerts: {
      slack: { enabled: boolean; webhook: string };
      discord: { enabled: boolean; webhook: string };
    };
  };
  safety: {
    configLock: boolean;
    onFailureAction: OnFailureAction;
    auditTrail: boolean;
  };
  observability?: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    lastRunAt: string;
    lastSuccessAt: string;
    lastFailureAt: string;
  };
}
