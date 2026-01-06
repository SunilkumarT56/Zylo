import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Settings,
  Database,
  Tv,
  Tag,
  Clock,
  User,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  PipelineWizardContext,
  type PipelineWizardContextType,
} from './create-pipeline/PipelineWizardContext';
import {
  type PipelineData,
  INITIAL_DATA,
  type ChannelData,
  type PrivacyStatus,
  type ExecutionMode,
  type SourceType,
} from './create-pipeline/types';

// Import Steps
import { Step1Identity } from './create-pipeline/steps/Step1Identity';
import { Step2Type } from './create-pipeline/steps/Step2Type';
import { Step3Source } from './create-pipeline/steps/Step3Source';
import { Step4YouTube } from './create-pipeline/steps/Step4YouTube';
import { Step5Metadata } from './create-pipeline/steps/Step5Metadata';
import { Step6Scheduling } from './create-pipeline/steps/Step6Scheduling';
import { StepAvatar } from './create-pipeline/steps/StepAvatar';

interface PipelineSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineName?: string; // We use name URL fetch details
  initialSection?: string;
  // If we already have details (e.g. from dashboard selectedPipeline), we can pass them to avoid fetch
  initialData?: PipelineDetails;
}

interface PipelineConfig {
  contentSource?: string;
  youtube?: {
    channelId?: string;
    privacy?: string;
    category?: string;
    madeForKids?: boolean;
  };
  metadata?: {
    titleTemplate?: string;
    descriptionTemplate?: string;
    tagsTemplate?: string;
    language?: string;
    region?: string;
  };
  thumbnail?: {
    mode?: 'auto' | 'upload' | 'template';
  };
  schedule?: {
    timezone?: string;
    frequency?: string;
    cronExpression?: string;
    intervalMinutes?: number;
  };
}

interface PipelineDetails {
  name?: string;
  pipeline_type?: 'youtube_long' | 'youtube_shorts';
  execution_mode?: 'manual' | 'scheduled';
  configuration?: PipelineConfig;
  color?: string;
  image_url?: string;
  header?: Record<string, unknown>; // Header is merged in
  [key: string]: unknown; // Allow loose props for now
}

// Map pipeline details (API) to PipelineData (Wizard)
const mapDetailsToData = (details: PipelineDetails): PipelineData => {
  if (!details) return INITIAL_DATA;

  const config = details.configuration || {};
  const youtube = config.youtube || {};
  const metadata = config.metadata || {};
  const schedule = config.schedule || {};

  // Determine Source Type
  let sourceType: string = 'upload';
  if (details.source_type) {
    sourceType = details.source_type as string;
  } else if (config.contentSource) {
    if (config.contentSource === 'Google Drive' || config.contentSource === 'google_drive')
      sourceType = 'google_drive';
    else if (config.contentSource === 'AWS S3' || config.contentSource === 's3') sourceType = 's3';
    else if (
      config.contentSource === 'Git Repository' ||
      config.contentSource === 'git' ||
      config.contentSource === 'git_repo'
    )
      sourceType = 'git';
    else if (config.contentSource === 'upload') sourceType = 'upload';
  }

  // Extract Source Config
  // Handle case where source_config might be returned as a string (if stored strictly as JSON string) or object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sourceConfig: Record<string, any> = {};
  const rawSourceConfig =
    details.source_config ||
    details.sourceConfig ||
    (config as Record<string, unknown>).sourceConfig;

  if (rawSourceConfig) {
    if (typeof rawSourceConfig === 'string') {
      try {
        sourceConfig = JSON.parse(rawSourceConfig);
      } catch (e) {
        console.error('Failed to parse sourceConfig', e);
      }
    } else {
      sourceConfig = rawSourceConfig;
    }
  }

  return {
    pipelineName: details.name || '',
    pipelineType: details.pipeline_type || 'youtube_long',
    executionMode: (details.executionMode || details.execution_mode || 'manual') as ExecutionMode,

    // Source
    sourceType: sourceType as SourceType,
    driveFolderId: sourceConfig.driveFolderId || '',
    s3Bucket: sourceConfig.s3Bucket || '',
    s3Prefix: sourceConfig.s3Prefix || '',
    gitRepoUrl: sourceConfig.gitRepoUrl || sourceConfig.repoUrl || '',
    gitBranch: sourceConfig.gitBranch || sourceConfig.branch || '',
    gitPath: sourceConfig.gitPath || sourceConfig.path || '',

    // YouTube
    connectedChannelId: youtube.channelId || '',
    defaultPrivacy: (youtube.privacy as PrivacyStatus) || 'private',
    category: youtube.category || 'People & Blogs',
    madeForKids: youtube.madeForKids || false,

    // Metadata
    titleTemplate: metadata.titleTemplate || '',
    descriptionTemplate: metadata.descriptionTemplate || '',
    tagsTemplate: metadata.tagsTemplate || '',
    language: metadata.language || 'en',
    region: metadata.region || 'US',
    thumbnailMode: config.thumbnail?.mode || 'auto',

    // Scheduling
    timezone: schedule.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    scheduleFrequency:
      schedule.frequency === 'Cron Expression' || schedule.frequency === 'cron'
        ? 'cron'
        : 'interval',
    cronExpression: schedule.cronExpression || '0 0 * * *',
    intervalMinutes: schedule.intervalMinutes || 60,
    color: details.color || INITIAL_DATA.color,
    userAvatar: details.image_url
      ? details.image_url.startsWith('http') || details.image_url.startsWith('data:')
        ? details.image_url
        : `https://untolerative-len-rumblingly.ngrok-free.dev/${details.image_url}`
      : undefined,
  };
};

export function PipelineSettingsModal({
  isOpen,
  onClose,
  pipelineName,
  initialSection = 'general',
  initialData,
}: PipelineSettingsModalProps) {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [loading, setLoading] = useState(false);
  const [pipelineData, setPipelineData] = useState<PipelineData>(INITIAL_DATA);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [userChannel, setUserChannel] = useState<ChannelData | null>(null);

  // Fetch Logic
  useEffect(() => {
    const fetchDetails = async () => {
      if (!pipelineName && !initialData) return;

      // If we have initial data, use it
      if (initialData) {
        setPipelineData(mapDetailsToData(initialData));
        return;
      }

      if (!pipelineName) return;

      setLoading(true);
      try {
        const token =
          localStorage.getItem('authToken') ||
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3Njc2NDAzODYsImV4cCI6MTc3NjE5Mzk4Nn0.8aandcUrp7hKDP8Ryw5xlP51Z0EZYKZyec8xM43lZUU';
        const response = await fetch(
          `https://untolerative-len-rumblingly.ngrok-free.dev/user/pipelines/${pipelineName}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify({ pipelineName }),
          },
        );
        if (response.ok) {
          const res = await response.json();
          const data = res.pipeline || res; // Handle varying structure
          if (data && data.header) {
            // Map the combined header + details
            setPipelineData(
              mapDetailsToData({
                ...data.header,
                ...data,
              }),
            );
          }
        }
      } catch (err) {
        console.error('Failed to fetch pipeline for settings', err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchDetails();

      // Also fetch connected YouTube channel
      const fetchChannel = async () => {
        try {
          const token =
            localStorage.getItem('authToken') ||
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3Njc2NDAzODYsImV4cCI6MTc3NjE5Mzk4Nn0.8aandcUrp7hKDP8Ryw5xlP51Z0EZYKZyec8xM43lZUU';
          const response = await fetch(
            'https://untolerative-len-rumblingly.ngrok-free.dev/user/yt-pipeline/me',
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
              },
            },
          );
          if (response.ok) {
            const data = await response.json();
            if (data.authenticated && data.responsePayload && data.responsePayload.success) {
              setUserChannel(data.responsePayload.channel);
            }
          }
        } catch (error) {
          console.error('Failed to fetch user channel', error);
        }
      };
      fetchChannel();
    }
  }, [isOpen, pipelineName, initialData]);

  // Sync activeSection with initialSection when modal opens or section changes
  useEffect(() => {
    if (isOpen) {
      setActiveSection(initialSection);
    }
  }, [isOpen, initialSection]);

  // Context Mocking
  const wizardContextValue: PipelineWizardContextType = useMemo(
    () => ({
      data: pipelineData,
      currentStep: 'identity', // Dummy, rendering depends on section
      setData: (updates: Partial<PipelineData>) => {
        setPipelineData((prev) => {
          const next = { ...prev, ...updates };
          setHasChanges(true); // Naive change detection
          return next;
        });
      },
      goToStep: () => {},
      goNext: () => {},
      goBack: () => {},
      reset: () => {},
      validationErrors,
      setValidationErrors,
      isStepValid: true,
      setStepValid: () => {},
      isOpen,
      setIsOpen: (val: boolean) => !val && onClose(),
      userChannel,
      setUserChannel,
      isSubmissionSuccess: false,
      setIsSubmissionSuccess: () => {},
    }),
    [pipelineData, validationErrors, isOpen, onClose, userChannel],
  );

  // Sections Config
  const SECTIONS = [
    {
      id: 'general',
      label: 'General',
      icon: <Settings className="w-4 h-4" />,
      component: (
        <div className="space-y-6">
          <Step1Identity allowNameEdit={false} />
          <Step2Type />
        </div>
      ),
    },
    {
      id: 'source',
      label: 'Content Source',
      icon: <Database className="w-4 h-4" />,
      component: <Step3Source />,
    },
    {
      id: 'youtube',
      label: 'YouTube Channel',
      icon: <Tv className="w-4 h-4" />,
      component: <Step4YouTube />,
    },
    {
      id: 'metadata',
      label: 'Metadata & Rules',
      icon: <Tag className="w-4 h-4" />,
      component: <Step5Metadata />,
    },
    {
      id: 'scheduling',
      label: 'Scheduling',
      icon: <Clock className="w-4 h-4" />,
      component: <Step6Scheduling />,
    },
    {
      id: 'avatar',
      label: 'Avatar',
      icon: <User className="w-4 h-4" />,
      component: <StepAvatar />,
    },
  ].filter((section) => {
    if (section.id === 'scheduling') {
      return pipelineData.executionMode === 'scheduled';
    }
    return true;
  });

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl h-[70vh] bg-[#191919] border border-[#2F2F2F] rounded-xl shadow-2xl flex overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sidebar */}
          <div className="w-64 bg-[#202020] border-r border-[#2F2F2F] flex flex-col">
            <div className="p-4 border-b border-[#2F2F2F]">
              <div className="flex items-center gap-3">
                {pipelineData.userAvatar ? (
                  <img
                    src={pipelineData.userAvatar}
                    className="w-8 h-8 rounded-md object-cover bg-black"
                    alt=""
                  />
                ) : (
                  <div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-500">
                    <Settings className="w-4 h-4" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <h3 className="text-sm font-medium text-white truncate">
                    {pipelineData.pipelineName || 'Settings'}
                  </h3>
                  <p className="text-xs text-zinc-500">Pipeline Settings</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2 p-2 space-y-0.5">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-[#2F2F2F] text-white'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#2F2F2F]/50'
                  }`}
                >
                  {section.icon}
                  {section.label}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-[#2F2F2F]">
              <div className="text-xs text-zinc-600 px-2">Version 1.0.2</div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col bg-[#191919]">
            {/* Header */}
            <div className="h-16 border-b border-[#2F2F2F] flex items-center justify-between px-8 bg-[#191919]">
              <h2 className="text-lg font-medium text-white">
                {SECTIONS.find((s) => s.id === activeSection)?.label}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Scrollable Form */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                </div>
              ) : (
                <PipelineWizardContext.Provider value={wizardContextValue}>
                  <div className="max-w-2xl">
                    {SECTIONS.find((s) => s.id === activeSection)?.component}
                  </div>
                </PipelineWizardContext.Provider>
              )}
            </div>

            {/* Footer Actions */}
            <div className="h-16 border-t border-[#2F2F2F] flex items-center justify-end px-8 bg-[#191919] gap-3">
              {hasChanges && (
                <span className="text-sm text-yellow-500 flex items-center gap-2 mr-2">
                  <AlertCircle className="w-4 h-4" /> Unsaved changes
                </span>
              )}
              <Button variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white">
                Cancel
              </Button>
              <Button
                disabled={!hasChanges || loading}
                className="bg-white text-black hover:bg-zinc-200"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const token =
                      localStorage.getItem('authToken') ||
                      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3Njc2NDAzODYsImV4cCI6MTc3NjE5Mzk4Nn0.8aandcUrp7hKDP8Ryw5xlP51Z0EZYKZyec8xM43lZUU';

                    // Construct sourceConfig
                    let sourceConfig = {};
                    switch (pipelineData.sourceType) {
                      case 'google_drive':
                        sourceConfig = { driveFolderId: pipelineData.driveFolderId };
                        break;
                      case 's3':
                        sourceConfig = {
                          s3Bucket: pipelineData.s3Bucket,
                          s3Prefix: pipelineData.s3Prefix,
                        };
                        break;
                      case 'git':
                        sourceConfig = {
                          gitRepoUrl: pipelineData.gitRepoUrl,
                          gitBranch: pipelineData.gitBranch,
                          gitPath: pipelineData.gitPath,
                        };
                        break;
                      // Add s3/git cases if defined in pipelineData types, otherwise defaults to empty
                      case 'upload':
                      default:
                        sourceConfig = {};
                        break;
                    }

                    const formData = new FormData();
                    // Append all fields expected by backend update
                    formData.append('pipelineName', pipelineData.pipelineName);
                    formData.append('color', pipelineData.color || '#3B82F6');
                    formData.append('pipelineType', pipelineData.pipelineType);
                    formData.append('executionMode', pipelineData.executionMode);
                    formData.append('sourceType', pipelineData.sourceType);
                    formData.append('sourceConfig', JSON.stringify(sourceConfig));
                    formData.append('connectedChannelId', pipelineData.connectedChannelId);
                    formData.append('defaultPrivacy', pipelineData.defaultPrivacy);
                    formData.append('category', pipelineData.category);
                    formData.append('madeForKids', String(pipelineData.madeForKids));

                    // Metadata
                    formData.append('titleTemplate', pipelineData.titleTemplate);
                    formData.append('descriptionTemplate', pipelineData.descriptionTemplate);
                    formData.append('tagsTemplate', pipelineData.tagsTemplate);
                    formData.append('language', pipelineData.language);
                    formData.append('region', pipelineData.region);
                    formData.append('thumbnailMode', pipelineData.thumbnailMode);

                    // Scheduling
                    formData.append('timezone', pipelineData.timezone);
                    formData.append('scheduleFrequency', pipelineData.scheduleFrequency);
                    if (pipelineData.cronExpression) {
                      formData.append('cronExpression', pipelineData.cronExpression);
                    }

                    // Append Image if present
                    if (pipelineData.userAvatarFile) {
                      formData.append(
                        'image',
                        pipelineData.userAvatarFile,
                        pipelineData.userAvatarFile.name,
                      );
                    }

                    const response = await fetch(
                      `https://untolerative-len-rumblingly.ngrok-free.dev/user/update-pipelines/${pipelineName}`,
                      {
                        method: 'POST',
                        headers: {
                          Authorization: `Bearer ${token}`,
                          'ngrok-skip-browser-warning': 'true',
                          // Content-Type must be undefined for FormData
                        },
                        body: formData,
                      },
                    );

                    if (response.ok) {
                      setHasChanges(false);
                      // Optionally refetch details or close
                      onClose(); // Close modal on success for now
                    } else {
                      console.error('Failed to update settings');
                      // Handle error UI?
                      alert('Failed to update settings');
                    }
                  } catch (error) {
                    console.error('Error saving settings:', error);
                    alert('Error saving settings');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
