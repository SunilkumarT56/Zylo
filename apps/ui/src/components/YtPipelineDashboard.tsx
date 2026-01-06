// ... imports
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Cpu,
  Loader2,
  LogOut,
  Copy,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings,
  Shield,
  Trash2,
  User,
  UserPlus,
  Users,
  Lock,
  X,
  HardDrive,
  RotateCcw,
  Youtube,
  Zap,
  LayoutDashboard,
  CreditCard,
  Puzzle,
  HelpCircle,
  Database,
  Globe,
  Video,
  ShieldAlert,
  AlertTriangle,
  Baby,
  Type,
  FileText,
  Hash,
  Activity,
  CheckCircle,
  CheckCircle2,
  SquareCheck,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { GlobalAnalyticsSnapshot } from './dashboard/GlobalAnalyticsSnapshot';
import { PipelineWizardProvider, usePipelineWizard } from './create-pipeline/PipelineWizardContext';
import { PipelineActionsMenu } from '@/components/PipelineActionsMenu';
import { CreatePipelineWizard } from './create-pipeline/CreatePipelineWizard';

import { type ChannelData } from './create-pipeline/types';
import { PipelineAdvancedSettingsModal } from './PipelineAdvancedSettingsModal';
import {
  type AdvancedSettings,
  ConfiguredBy,
  OnFailureAction,
} from './PipelineAdvancedSettingsModels';

interface Pipeline {
  name: string;
  admin_name: string;
  color?: string;
  _id?: string;
  image_url?: string;
  execution_mode?: 'manual' | 'scheduled';
}

interface PipelineDetails extends Pipeline {
  pipeline_type: string;
  execution_mode: 'manual' | 'scheduled';
  created_at: string;
  status: string;
  // Detailed fields
  readiness?: {
    sourceConfigured: boolean;
    youtubeConnected: boolean;
    scheduleConfigured: boolean;
    adminLimitsApplied: boolean;
    verified: boolean;
  };
  configuration?: {
    contentSource: string;
    approvalFlow: {
      enabled: boolean;
      stages: string[];
    };
    youtube: {
      channelId: string;
      category: string;
      privacy: string;
      madeForKids: boolean;
    };
    metadata: {
      language: string;
      region: string;
      titleTemplate: string;
      descriptionTemplate: string;
      tagsTemplate: string;
    };
    thumbnail: {
      mode: string;
    };
    schedule: {
      frequency: string;
      timezone: string;
    };
  };
  adminLimits?: {
    execution: {
      maxConcurrentRuns: number;
      retryCount: number;
      timeoutPerStepSeconds: number;
    };
    resources: {
      cpu: number;
      memoryMB: number;
      storageMB: number;
      dailyUploads: number;
    };
    safety: {
      onFailureAction: string;
      autoDisableAfterFailures: number;
      auditTrailEnabled: boolean;
      locked: boolean;
    };
  };
  metadata?: {
    createdAt: string;
    updatedAt: string;
    ownerUserId: string;
  };
}

interface ChannelDetails {
  title: string;
  email: string;
  thumbnails?: {
    default?: {
      url: string;
    };
  };
}

function DashboardContent() {
  const navigate = useNavigate();

  const { setIsOpen, setUserChannel } = usePipelineWizard();
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [dropdownPage, setDropdownPage] = useState(0);

  const [selectedPipeline, setSelectedPipeline] = useState<PipelineDetails | null>(null);
  const [pipelineChannelDetails, setPipelineChannelDetails] = useState<ChannelDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [isSidebarMenuOpen, setIsSidebarMenuOpen] = useState(false);
  const [isPipelinesExpanded, setIsPipelinesExpanded] = useState(true);
  const [sidebarPipelinePage, setSidebarPipelinePage] = useState(0);
  const [showOwnerIdMenu, setShowOwnerIdMenu] = useState(false);
  const [showChannelIdMenu, setShowChannelIdMenu] = useState(false);
  const [trashCount, setTrashCount] = useState(0);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const [trashedPipelines, setTrashedPipelines] = useState<{ name: string }[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [automationErrorData, setAutomationErrorData] = useState<{
    message: string;
    reasons: string[];
  } | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isStartingAutomation, setIsStartingAutomation] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [automationSuccessData, setAutomationSuccessData] = useState<{
    message: string;
  } | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [activePipelinesCount, setActivePipelinesCount] = useState(0);

  useEffect(() => {
    const fetchActiveCount = async () => {
      try {
        const token =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3Njc2NDAzODYsImV4cCI6MTc3NjE5Mzk4Nn0.8aandcUrp7hKDP8Ryw5xlP51Z0EZYKZyec8xM43lZUU';
        const response = await fetch(
          'https://untolerative-len-rumblingly.ngrok-free.dev/user/get-count-pipelines',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true',
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          if (data.status) {
            setActivePipelinesCount(data.count);
          }
        }
      } catch (error) {
        console.error('Failed to fetch active pipelines count', error);
      }
    };

    fetchActiveCount();
  }, []);

  const fetchTrashCount = async () => {
    try {
      const response = await fetch(
        'https://untolerative-len-rumblingly.ngrok-free.dev/user/trash',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3Njc2NDAzODYsImV4cCI6MTc3NjE5Mzk4Nn0.8aandcUrp7hKDP8Ryw5xlP51Z0EZYKZyec8xM43lZUU',
          },
          body: JSON.stringify({ event: 'count' }),
        },
      );
      const data = await response.json();
      if (data.status) {
        setTrashCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch trash count', error);
    }
  };

  useEffect(() => {
    fetchTrashCount();
  }, []);

  const handleTrashClick = async () => {
    setIsTrashModalOpen(true);
    try {
      const response = await fetch(
        'https://untolerative-len-rumblingly.ngrok-free.dev/user/trash',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3Njc2NDAzODYsImV4cCI6MTc3NjE5Mzk4Nn0.8aandcUrp7hKDP8Ryw5xlP51Z0EZYKZyec8xM43lZUU',
          },
          body: JSON.stringify({ event: 'visit' }),
        },
      );
      const data = await response.json();
      if (data.status) {
        setTrashedPipelines(data.trashedPipelines);
      }
    } catch (error) {
      console.error('Failed to fetch trash items', error);
    }
  };

  const handleRestore = async (name: string) => {
    try {
      const response = await fetch(
        'https://untolerative-len-rumblingly.ngrok-free.dev/user/trash',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3Njc2NDAzODYsImV4cCI6MTc3NjE5Mzk4Nn0.8aandcUrp7hKDP8Ryw5xlP51Z0EZYKZyec8xM43lZUU',
          },
          body: JSON.stringify({ event: 'restore', name }),
        },
      );
      const data = await response.json();
      if (data.status) {
        // Refresh list and count
        fetchTrashCount();
        handleTrashClick(); // Reload list
        window.location.reload(); // To show restored pipeline in main list
      }
    } catch (error) {
      console.error('Failed to restore pipeline', error);
    }
  };

  const handleDeleteForever = async (name: string) => {
    if (confirmDeleteId !== name) {
      setConfirmDeleteId(name);
      return;
    }

    try {
      const response = await fetch(
        'https://untolerative-len-rumblingly.ngrok-free.dev/user/trash',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3Njc2NDAzODYsImV4cCI6MTc3NjE5Mzk4Nn0.8aandcUrp7hKDP8Ryw5xlP51Z0EZYKZyec8xM43lZUU',
          },
          body: JSON.stringify({ event: 'delete', name }),
        },
      );
      const data = await response.json();
      if (data.status) {
        // Refresh list and count
        fetchTrashCount();
        setTrashedPipelines((prev) => prev.filter((p) => p.name !== name));
        setConfirmDeleteId(null);
      }
    } catch (error) {
      console.error('Failed to delete pipeline', error);
    }
  };

  // Advanced Settings State

  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    approvalFlow: { enabled: false, stages: ['Editor', 'Reviewer', 'Admin'] },
    executionLimits: {
      maxConcurrentRuns: 1,
      maxDailyUploads: 6,
      maxFileSizeMB: 2048,
      totalStorageMB: 10240,
      timeoutPerStepSeconds: 300,
      autoDisableAfterFailures: 3,
      cpuLimit: 1,
      retryCount: 2,
      configuredBy: ConfiguredBy.SYSTEM,
    },
    events: {
      onSuccessWebhook: '',
      onFailureWebhook: '',
      alerts: {
        slack: { enabled: false, webhook: '' },
        discord: { enabled: false, webhook: '' },
      },
    },
    safety: { configLock: false, onFailureAction: OnFailureAction.NONE, auditTrail: true },
    observability: {
      totalRuns: 142,
      successfulRuns: 138,
      failedRuns: 4,
      lastRunAt: '2 hours ago',
      lastSuccessAt: '2 hours ago',
      lastFailureAt: '3 days ago',
    },
  });

  // Sync settings when pipeline is selected
  useEffect(() => {
    if (selectedPipeline) {
      setAdvancedSettings((prev) => ({
        ...prev,
        approvalFlow: {
          ...prev.approvalFlow,
          enabled: selectedPipeline.configuration?.approvalFlow?.enabled || false,
          stages: selectedPipeline.configuration?.approvalFlow?.stages || [
            'Editor',
            'Reviewer',
            'Admin',
          ],
        },
        executionLimits: {
          ...prev.executionLimits,
          maxConcurrentRuns: selectedPipeline.adminLimits?.execution.maxConcurrentRuns || 1,
          maxDailyUploads: selectedPipeline.adminLimits?.resources.dailyUploads || 6,
          timeoutPerStepSeconds:
            selectedPipeline.adminLimits?.execution.timeoutPerStepSeconds || 300,
          retryCount: selectedPipeline.adminLimits?.execution.retryCount || 2,
          cpuLimit: selectedPipeline.adminLimits?.resources.cpu || 1,
          autoDisableAfterFailures:
            selectedPipeline.adminLimits?.safety.autoDisableAfterFailures || 3,
        },
        safety: {
          ...prev.safety,
          configLock: selectedPipeline.adminLimits?.safety.locked || false,
          onFailureAction:
            (selectedPipeline.adminLimits?.safety.onFailureAction as OnFailureAction) ||
            OnFailureAction.NONE,
          auditTrail: selectedPipeline.adminLimits?.safety.auditTrailEnabled || false,
        },
      }));
    }
  }, [selectedPipeline]);

  const handleSaveSettings = async (newSettings: AdvancedSettings) => {
    setAdvancedSettings(newSettings);

    if (selectedPipeline?.name) {
      try {
        const token =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3Njc2NDAzODYsImV4cCI6MTc3NjE5Mzk4Nn0.8aandcUrp7hKDP8Ryw5xlP51Z0EZYKZyec8xM43lZUU';

        const payload = {
          approvalFlow: {
            enable: newSettings.approvalFlow.enabled,
            stage: newSettings.approvalFlow.stages,
          },
          adminSettings: {
            cpuLimit: newSettings.executionLimits.cpuLimit,
            retryCount: newSettings.executionLimits.retryCount,
            configuredBy: newSettings.executionLimits.configuredBy,
            memoryLimitMB: newSettings.executionLimits.maxFileSizeMB,
            storageQuotaMB: newSettings.executionLimits.totalStorageMB,
            onFailureAction: newSettings.safety.onFailureAction,
            dailyUploadQuota: newSettings.executionLimits.maxDailyUploads,
            auditTrailEnabled: newSettings.safety.auditTrail,
            maxConcurrentRuns: newSettings.executionLimits.maxConcurrentRuns,
            lockCriticalSettings: newSettings.safety.configLock,
            timeoutPerStepSeconds: newSettings.executionLimits.timeoutPerStepSeconds,
            autoDisableAfterFailures: newSettings.executionLimits.autoDisableAfterFailures,
          },
          integrations: {
            webhooks: {
              onSuccess: {
                enabled: !!newSettings.events.onSuccessWebhook,
                url: newSettings.events.onSuccessWebhook || null,
                timeoutSeconds: newSettings.events.webhookSettings?.timeoutSeconds || 30,
              },
              onFailure: {
                enabled: !!newSettings.events.onFailureWebhook,
                url: newSettings.events.onFailureWebhook || null,
                timeoutSeconds: newSettings.events.webhookSettings?.timeoutSeconds || 30,
              },
            },
            alerts: {
              slack: {
                enabled: newSettings.events.alerts.slack.enabled,
                webhookUrl: newSettings.events.alerts.slack.webhook || null,
              },
              discord: {
                enabled: newSettings.events.alerts.discord.enabled,
                webhookUrl: newSettings.events.alerts.discord.webhook || null,
              },
            },
            behavior: {
              nonBlocking: newSettings.events.webhookSettings?.behavior?.nonBlocking ?? true,
            },
          },
          schedule: {
            enabled: newSettings.scheduling?.enabled || false,
            timezone: newSettings.scheduling?.timezone || 'UTC',
            frequency: newSettings.scheduling?.frequency || 'cron',
            cronExpression: newSettings.scheduling?.cronExpression,
            intervalMinutes: newSettings.scheduling?.intervalMinutes,
          },
          executionMode: newSettings.scheduling?.enabled ? 'scheduled' : 'manual',
        };

        console.log('Sending payload:', payload);

        const response = await fetch(
          `https://untolerative-len-rumblingly.ngrok-free.dev/user/update-advancedsettings/${selectedPipeline.name}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          console.error('Failed to update settings');
        } else {
          const data = await response.json();
          console.log('Update success:', data);
        }
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    }
  };

  const handleRunPipeline = async (pipelineName?: string, showBlur: boolean = false) => {
    const targetName = pipelineName || selectedPipeline?.name;
    if (!targetName) return;

    if (showBlur) {
      setIsStartingAutomation(true);
      // Artificial delay to ensure user sees the loading state
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    try {
      const token =
        localStorage.getItem('authToken') ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3Njc2NDAzODYsImV4cCI6MTc3NjE5Mzk4Nn0.8aandcUrp7hKDP8Ryw5xlP51Z0EZYKZyec8xM43lZUU';

      console.log(`Starting pipeline: ${targetName}`);

      const response = await fetch(
        `https://untolerative-len-rumblingly.ngrok-free.dev/user/pipeline/run/${targetName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          },
        },
      );

      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error('Failed to parse response JSON', err);
      }

      // Check for success: HTTP 200-299 AND logical success if 'status' field exists
      if (response.ok && data?.status !== false) {
        console.log('Pipeline started successfully', data);
        setAutomationSuccessData({
          message: data?.message || 'Automation started successfully.',
        });
        setIsSuccessModalOpen(true);
        setTimeout(() => setIsSuccessModalOpen(false), 3000);
      } else {
        // Handle failure cases: 422 status OR logical failure (status: false)
        if (response.status === 422 || data?.status === false) {
          setAutomationErrorData({
            message: data?.message || 'Pipeline cannot be started',
            reasons: data?.reasons || [],
          });
          setIsErrorModalOpen(true);
        } else {
          console.error('Failed to start pipeline', data);
        }
      }
    } catch (error) {
      console.error('Error starting pipeline:', error);
    } finally {
      if (showBlur) {
        setIsStartingAutomation(false);
      }
    }
  };

  useEffect(() => {
    // ... permission check logic (same as before)
    const checkPermission = async () => {
      let token = localStorage.getItem('authToken');

      if (!token) {
        console.log('Using fallback hardcoded token for dashboard');
        token =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3Njc2NDAzODYsImV4cCI6MTc3NjE5Mzk4Nn0.8aandcUrp7hKDP8Ryw5xlP51Z0EZYKZyec8xM43lZUU';
      }

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch Channel Info
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
            setHasPermission(true);
            setChannelData(data.responsePayload.channel);
            setUserChannel(data.responsePayload.channel);
            setUserEmail(data.responsePayload.email);

            // 2. Fetch Pipelines (only if authenticated)
            try {
              const pipelinesResponse = await fetch(
                'https://untolerative-len-rumblingly.ngrok-free.dev/user/pipelines',
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                  },
                },
              );
              if (pipelinesResponse.ok) {
                const pipelinesData = await pipelinesResponse.json();
                if (Array.isArray(pipelinesData)) {
                  setPipelines(pipelinesData);
                } else if (pipelinesData.pipelines && Array.isArray(pipelinesData.pipelines)) {
                  setPipelines(pipelinesData.pipelines);
                } else if (pipelinesData.name) {
                  // Single object case
                  setPipelines([pipelinesData]);
                }
              }
            } catch (err) {
              console.error('Failed to fetch pipelines', err);
              // MOCK DATA FOR UI VERIFICATION (Persisted for user check)
              setPipelines([
                {
                  name: 'Majic Mafia',
                  admin_name: 'Sunil Kumar',
                  color: '#EF4444',
                  _id: 'mock-1',
                  image_url: 'https://github.com/shadcn.png',
                },
              ]);
            }
          } else {
            setHasPermission(false);
          }
        } else {
          setHasPermission(false);
        }
      } catch (error) {
        console.error('Permission check failed', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [setUserChannel]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const handlePipelineClick = async (pipeline: Pipeline) => {
    setIsLoadingDetails(true);
    setSelectedPipeline(null);
    setPipelineChannelDetails(null);

    try {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3Njc2NDAzODYsImV4cCI6MTc3NjE5Mzk4Nn0.8aandcUrp7hKDP8Ryw5xlP51Z0EZYKZyec8xM43lZUU';
      const response = await fetch(
        `https://untolerative-len-rumblingly.ngrok-free.dev/user/pipelines/${pipeline.name}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({ pipelineName: pipeline.name }),
        },
      );

      if (response.ok) {
        const responseData = await response.json();

        // Handle different response structures
        let rawPipeline = null;
        if (
          responseData.pipelines &&
          Array.isArray(responseData.pipelines) &&
          responseData.pipelines.length > 0
        ) {
          rawPipeline = responseData.pipelines[0];
        } else if (responseData.pipeline) {
          rawPipeline = responseData.pipeline;
        } else if (responseData.header) {
          // Case where data IS the pipeline object (legacy/mock wrapper)
          rawPipeline = responseData;
        }

        if (rawPipeline) {
          // Helper to map backend fields to UI state shape
          const mappedPipeline: PipelineDetails = {
            // Base fields - Check header first (priority for nested structure)
            name: rawPipeline.header?.name || rawPipeline.name,
            admin_name: rawPipeline.admin_name || 'Admin', // Default as it's missing in new response
            image_url: rawPipeline.header?.image || rawPipeline.image_url,
            color: rawPipeline.header?.color || rawPipeline.color,
            status: rawPipeline.header?.status || rawPipeline.status,
            pipeline_type: rawPipeline.header?.pipelineType || rawPipeline.pipeline_type,
            execution_mode: rawPipeline.header?.executionMode || rawPipeline.execution_mode,
            _id: rawPipeline.header?.id || rawPipeline.id || rawPipeline._id,
            created_at:
              rawPipeline.header?.createdAt ||
              rawPipeline.metadata?.createdAt ||
              rawPipeline.created_at,

            // Configuration Mapping
            // If rawPipeline has 'configuration', use it directly (deep format).
            // Fallback to flat fields (e.g. metadata_strategy) for flat format.
            configuration: {
              ...(rawPipeline.configuration || {}),
              metadata: {
                ...(rawPipeline.configuration?.metadata || rawPipeline.metadata_strategy || {}),
                tagsTemplate:
                  rawPipeline.configuration?.metadata?.tagsTemplate ||
                  rawPipeline.metadata_strategy?.tagsTemplate,
              },
              youtube: {
                ...(rawPipeline.configuration?.youtube || rawPipeline.youtube_config || {}),
                madeForKids:
                  String(
                    rawPipeline.configuration?.youtube?.madeForKids ??
                      rawPipeline.youtube_config?.madeForKids ??
                      false,
                  ) === 'true',
              },
              contentSource:
                rawPipeline.configuration?.contentSource || rawPipeline.content_source?.type,
              schedule: rawPipeline.configuration?.schedule || rawPipeline.schedule_config,
              thumbnail: rawPipeline.configuration?.thumbnail || rawPipeline.thumbnail_config,
              approvalFlow: {
                enabled:
                  rawPipeline.approveFlow?.enable ??
                  rawPipeline.configuration?.approvalFlow?.enabled ??
                  rawPipeline.configuration?.approvalFlow ??
                  rawPipeline.approval_flow?.enabled ??
                  false,
                stages:
                  rawPipeline.approveFlow?.stage ??
                  rawPipeline.configuration?.stages ??
                  rawPipeline.approval_flow?.flow ??
                  [],
              },
            },

            // Admin Limits Mapping
            // Prioritize existing 'adminLimits' object, else map from 'admin_settings'
            adminLimits: rawPipeline.adminLimits
              ? {
                  execution: {
                    maxConcurrentRuns: rawPipeline.adminLimits.execution.maxConcurrentRuns,
                    retryCount: rawPipeline.adminLimits.execution.retryCount,
                    timeoutPerStepSeconds: rawPipeline.adminLimits.execution.timeoutPerStepSeconds,
                  },
                  resources: {
                    cpu: rawPipeline.adminLimits.resources.cpu,
                    memoryMB: rawPipeline.adminLimits.resources.memoryMB,
                    storageMB:
                      rawPipeline.adminLimits.resources.storageMB ||
                      rawPipeline.adminLimits.resources[' '] ||
                      0,
                    dailyUploads: rawPipeline.adminLimits.resources.dailyUploads,
                  },
                  safety: {
                    onFailureAction: rawPipeline.adminLimits.safety.onFailureAction,
                    autoDisableAfterFailures:
                      rawPipeline.adminLimits.safety.autoDisableAfterFailures,
                    auditTrailEnabled: rawPipeline.adminLimits.safety.auditTrailEnabled,
                    locked: rawPipeline.adminLimits.safety.locked,
                  },
                }
              : rawPipeline.admin_settings
              ? {
                  execution: {
                    maxConcurrentRuns: rawPipeline.admin_settings.maxConcurrentRuns,
                    timeoutPerStepSeconds: rawPipeline.admin_settings.timeoutPerStepSeconds,
                    retryCount: rawPipeline.admin_settings.retryCount,
                  },
                  resources: {
                    dailyUploads: rawPipeline.admin_settings.dailyUploads,
                    memoryMB: rawPipeline.admin_settings.memoryLimitMB,
                    storageMB: rawPipeline.admin_settings.storageQuotaMB,
                    cpu: rawPipeline.admin_settings.cpuLimit,
                  },
                  safety: {
                    onFailureAction: rawPipeline.admin_settings.onFailureAction,
                    auditTrailEnabled: rawPipeline.admin_settings.auditTrailEnabled,
                    locked: rawPipeline.admin_settings.lockCriticalSettings,
                    autoDisableAfterFailures: rawPipeline.admin_settings.autoDisableAfterFailures,
                  },
                }
              : undefined,

            // Readiness (Take direct object, else construct)
            readiness: rawPipeline.readiness || {
              sourceConfigured: !!(
                rawPipeline.content_source || rawPipeline.configuration?.contentSource
              ),
              youtubeConnected: !!(
                rawPipeline.youtube_config?.channelId ||
                rawPipeline.configuration?.youtube?.channelId
              ),
              scheduleConfigured: !!(
                rawPipeline.schedule_config || rawPipeline.configuration?.schedule
              ),
              adminLimitsApplied: !!(rawPipeline.admin_settings || rawPipeline.adminLimits),
              verified: rawPipeline.status === 'active' || rawPipeline.status === 'CREATED',
            },

            // Metadata (Timestamps)
            metadata: rawPipeline.metadata || {
              createdAt: rawPipeline.created_at,
              updatedAt: rawPipeline.updated_at,
              ownerUserId: rawPipeline.owner_user_id,
            },
          };

          setSelectedPipeline(mappedPipeline);

          // Fetch Pipeline Specific Channel Info
          try {
            const channelResponse = await fetch(
              'https://untolerative-len-rumblingly.ngrok-free.dev/user/yt-pipeline/me',
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'ngrok-skip-browser-warning': 'true',
                },
              },
            );
            if (channelResponse.ok) {
              const data = await channelResponse.json();
              if (data.authenticated && data.responsePayload && data.responsePayload.channel) {
                setPipelineChannelDetails({
                  ...data.responsePayload.channel,
                  email: data.responsePayload.email,
                });
              }
            }
          } catch (err) {
            console.error('Failed to fetch pipeline channel details', err);
          }
        }
      } else {
        console.error('Failed to fetch details');
        // Fallback or error state
      }
    } catch (e) {
      console.error('Error fetching details', e);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="h-8 w-8 text-white/20 animate-spin" />
      </div>
    );
  }

  if (!hasPermission) {
    return (
      // ... existing permission check failure UI
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground relative overflow-hidden font-sans">
        <div className="text-center z-10 p-8 border border-border bg-card rounded-xl max-w-md w-full mx-4 shadow-2xl">
          <div className="h-12 w-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
            <Youtube className="h-6 w-6 text-foreground" />
          </div>
          <h1 className="text-xl font-medium mb-2 text-foreground">Connect YouTube</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            Connect your YouTube account to access the automation pipeline.
          </p>
          <Button
            onClick={() =>
              (window.location.href =
                'https://untolerative-len-rumblingly.ngrok-free.dev/auth/google')
            }
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          >
            Connect Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#191919] text-[#D4D4D4] font-sans flex flex-col">
      <CreatePipelineWizard />

      <div className="flex-1 flex max-w-full w-full">
        {/* Static Sidebar */}
        <div className="w-64 border-r border-[#2F2F2F] bg-[#191919] flex flex-col h-full hidden md:flex shrink-0 font-sans">
          {/* Workspace Switcher / User Profile Header */}
          <div
            className="h-12 flex items-center px-3 hover:bg-[#2F2F2F] cursor-pointer transition-colors relative m-2 rounded-md group"
            onClick={() => setIsSidebarMenuOpen(!isSidebarMenuOpen)}
          >
            <div className="w-5 h-5 rounded overflow-hidden mr-2 bg-black flex items-center justify-center shrink-0 border border-[#333]">
              <Logo className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-[#E3E3E3] truncate flex-1 leading-none">
              {channelData?.title || "Sunil's Workspace"}
            </span>
            <div className="p-0.5 rounded hover:bg-[#3F3F3F] text-[#999]">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isSidebarMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="absolute top-10 left-0 w-72 bg-[#252525] border border-[#333] rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Current Workspace/User Header */}
                  <div className="p-3 pb-2">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded bg-black border border-[#333] flex items-center justify-center text-[#E3E3E3] overflow-hidden">
                        {channelData?.thumbnails?.default?.url ? (
                          <img
                            src={channelData.thumbnails.default.url}
                            alt="Channel Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Logo className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#E3E3E3]">
                          {channelData?.title || 'Zylo Workspace'}
                        </span>
                        <span className="text-[11px] text-[#999]">Free Plan · 1 member</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center justify-center gap-2 h-7 rounded border border-[#333] hover:bg-[#2F2F2F] cursor-pointer transition-colors text-xs text-[#E3E3E3]">
                        <Settings className="w-3.5 h-3.5" />
                        Settings
                      </div>
                      <div className="flex-1 flex items-center justify-center gap-2 h-7 rounded border border-[#333] hover:bg-[#2F2F2F] cursor-pointer transition-colors text-xs text-[#E3E3E3]">
                        <UserPlus className="w-3.5 h-3.5" />
                        Invite members
                      </div>
                    </div>
                  </div>

                  {/* Account List */}
                  <div className="flex-1 overflow-y-auto max-h-[300px] border-t border-[#333]">
                    <div className="px-3 py-2">
                      <div className="flex items-center justify-between mb-2 relative">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-[#777]">{userEmail}</span>
                          <Youtube className="w-3 h-3 text-red-500" />
                        </div>
                      </div>

                      {/* Pipelines List as Workspaces */}
                      <div className="space-y-0.5">
                        {pipelines
                          .slice(dropdownPage * 4, (dropdownPage + 1) * 4)
                          .map((pipeline) => (
                            <div
                              key={pipeline._id}
                              className="flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-[#2F2F2F] cursor-pointer transition-colors group"
                              onClick={() => {
                                handlePipelineClick(pipeline);
                                setIsSidebarMenuOpen(false);
                              }}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {pipeline.image_url ? (
                                  <div className="w-6 h-6 rounded bg-[#333] shrink-0 border border-[#3F3F3F] overflow-hidden">
                                    <img
                                      src={pipeline.image_url}
                                      alt={pipeline.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded bg-[#333] flex items-center justify-center text-[10px] text-[#999] group-hover:text-[#E3E3E3] group-hover:bg-[#3F3F3F] transition-colors shrink-0">
                                    {pipeline.name[0].toUpperCase()}
                                  </div>
                                )}
                                <span
                                  className={`text-sm truncate ${
                                    selectedPipeline?.name === pipeline.name
                                      ? 'text-[#E3E3E3]'
                                      : 'text-[#999] group-hover:text-[#E3E3E3]'
                                  }`}
                                >
                                  {pipeline.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {selectedPipeline?.name === pipeline.name && (
                                  <Check className="w-3.5 h-3.5 text-[#E3E3E3]" />
                                )}
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  {/* Scale down to fit compact row */}
                                  <div className="scale-75 origin-center">
                                    <PipelineActionsMenu
                                      pipeline={pipeline}
                                      onRunPipeline={(name) => handleRunPipeline(name, true)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                        {/* Pagination Controls */}
                        {pipelines.length > 4 && (
                          <div className="flex items-center justify-between px-2 pt-1 pb-1">
                            {dropdownPage > 0 ? (
                              <span
                                className="text-[10px] text-[#777] hover:text-[#E3E3E3] cursor-pointer select-none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDropdownPage((p) => p - 1);
                                }}
                              >
                                Prev
                              </span>
                            ) : (
                              <div />
                            )}

                            {pipelines.length > (dropdownPage + 1) * 4 && (
                              <span
                                className="text-[10px] text-blue-500 hover:text-blue-400 cursor-pointer font-medium select-none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDropdownPage((p) => p + 1);
                                }}
                              >
                                Next
                              </span>
                            )}
                          </div>
                        )}

                        {/* Create New Pipeline */}
                        <div
                          onClick={() => {
                            setIsSidebarMenuOpen(false);
                            setIsOpen(true);
                          }}
                          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#2F2F2F] cursor-pointer transition-colors text-[#999] hover:text-[#E3E3E3] mt-1"
                        >
                          <div className="w-6 h-6 flex items-center justify-center">
                            <Plus className="w-4 h-4" />
                          </div>
                          <span className="text-sm">New pipeline</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-[#333] p-1">
                    <div
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-[#2F2F2F] text-[#999] hover:text-[#E3E3E3] cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span className="text-xs">Log out all accounts</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Navigation */}
          {/* Main Navigation */}
          <div className="px-2 mb-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
            <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#2F2F2F] text-[#999] hover:text-[#E3E3E3] cursor-pointer transition-colors group mb-6">
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-sm font-medium">Overview</span>
            </div>

            <div className="space-y-1 mb-6">
              <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#2F2F2F] text-[#999] hover:text-[#E3E3E3] cursor-pointer transition-colors group">
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Settings</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#2F2F2F] text-[#999] hover:text-[#E3E3E3] cursor-pointer transition-colors group">
                <Puzzle className="w-4 h-4" />
                <span className="text-sm font-medium">Integrations</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#2F2F2F] text-[#999] hover:text-[#E3E3E3] cursor-pointer transition-colors group">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">Usage & Billing</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#2F2F2F] text-[#999] hover:text-[#E3E3E3] cursor-pointer transition-colors group">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Zylo MCP</span>
              </div>
            </div>

            <div
              className="mb-2 px-2 flex items-center justify-between cursor-pointer group"
              onClick={() => setIsPipelinesExpanded(!isPipelinesExpanded)}
            >
              <span className="text-xs font-semibold text-[#525252] uppercase tracking-wider group-hover:text-[#D4D4D4] transition-colors">
                Pipelines
              </span>
              {isPipelinesExpanded ? (
                <ChevronDown className="w-3 h-3 text-[#525252] group-hover:text-[#D4D4D4] transition-colors" />
              ) : (
                <ChevronRight className="w-3 h-3 text-[#525252] group-hover:text-[#D4D4D4] transition-colors" />
              )}
            </div>

            {isPipelinesExpanded && (
              <div className="space-y-0.5 mb-6">
                {pipelines
                  .slice(sidebarPipelinePage * 3, (sidebarPipelinePage + 1) * 3)
                  .map((pipeline) => (
                    <div
                      key={pipeline._id || pipeline.name}
                      onClick={() => handlePipelineClick(pipeline)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors group relative ${
                        selectedPipeline?.name === pipeline.name
                          ? 'bg-[#2F2F2F] text-[#E3E3E3]'
                          : 'text-[#999] hover:bg-[#2F2F2F] hover:text-[#E3E3E3]'
                      }`}
                    >
                      <div className="truncate text-sm font-medium flex-1">{pipeline.name}</div>
                      {/* 3-dots menu */}
                      <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PipelineActionsMenu
                          pipeline={pipeline}
                          preloadedSettings={
                            selectedPipeline?.name === pipeline.name ? advancedSettings : undefined
                          }
                          onRunPipeline={(name) => handleRunPipeline(name, true)}
                        />
                      </div>
                    </div>
                  ))}
                {pipelines.length === 0 && (
                  <div className="px-2 py-1 text-xs text-[#525252] italic">No pipelines found</div>
                )}

                {/* Pagination Controls */}
                {pipelines.length > 3 && (
                  <div className="flex items-center justify-between px-2 pt-1">
                    {sidebarPipelinePage > 0 ? (
                      <span
                        className="text-[10px] text-[#777] hover:text-[#E3E3E3] cursor-pointer select-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSidebarPipelinePage((p) => p - 1);
                        }}
                      >
                        Prev
                      </span>
                    ) : (
                      <div />
                    )}

                    {pipelines.length > (sidebarPipelinePage + 1) * 3 && (
                      <span
                        className="text-[10px] text-blue-500 hover:text-blue-400 cursor-pointer font-medium select-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSidebarPipelinePage((p) => p + 1);
                        }}
                      >
                        Next
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Fixed Navigation */}
          <div className="px-2 mb-14 space-y-1 pt-2 border-t border-[#2F2F2F]">
            {/* Profile & Team Group */}

            {/* Profile & Team Group */}
            <div className="relative">
              <div
                className={`flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#2F2F2F] cursor-pointer transition-colors group ${
                  isProfilePopupOpen
                    ? 'bg-[#2F2F2F] text-[#E3E3E3]'
                    : 'text-[#999] hover:text-[#E3E3E3]'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfilePopupOpen(!isProfilePopupOpen);
                }}
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Profile</span>
              </div>

              {/* Profile Popup */}
              <AnimatePresence>
                {isProfilePopupOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.1 }}
                    className="absolute bottom-full left-0 mb-2 w-72 bg-[#191919] border border-[#333] rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4 pb-3">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-black border border-[#333] flex items-center justify-center text-[#E3E3E3] overflow-hidden">
                          {channelData?.thumbnails?.default?.url ? (
                            <img
                              src={channelData.thumbnails.default.url}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Logo className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">Zylo</span>
                          <span className="text-xs text-[#888]">Free Plan · 1 member</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-2 h-8 rounded-lg border border-[#333] bg-[#252525] hover:bg-[#2F2F2F] hover:border-[#444] cursor-pointer transition-all text-xs font-medium text-zinc-300 hover:text-white">
                          <Settings className="w-3.5 h-3.5" />
                          Settings
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 h-8 rounded-lg border border-[#333] bg-[#252525] hover:bg-[#2F2F2F] hover:border-[#444] cursor-pointer transition-all text-xs font-medium text-zinc-300 hover:text-white">
                          <UserPlus className="w-3.5 h-3.5" />
                          Invite members
                        </button>
                      </div>
                    </div>

                    <div className="px-4 py-3 border-t border-[#333] bg-[#202020]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#888] font-medium">
                          {userEmail || 'sunilbe2006@gmail.com'}
                        </span>
                        <Youtube className="w-4 h-4 text-red-500" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#2F2F2F] text-[#999] hover:text-[#E3E3E3] cursor-pointer transition-colors group">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Team</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#2F2F2F] text-[#999] hover:text-[#E3E3E3] cursor-pointer transition-colors group">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Security</span>
            </div>
            <div
              className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#2F2F2F] text-[#999] hover:text-[#E3E3E3] cursor-pointer transition-colors group"
              onClick={handleTrashClick}
            >
              <Trash2 className="w-4 h-4" />
              <div className="flex items-center justify-between flex-1">
                <span className="text-sm font-medium">Trash</span>
                {trashCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full leading-none">
                    {trashCount}
                  </span>
                )}
              </div>
            </div>
            <div
              className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#2F2F2F] text-[#999] hover:text-[#E3E3E3] cursor-pointer transition-colors group"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </div>
          </div>

          <div className="px-5 mb-5">
            <HelpCircle className="w-4 h-4 text-[#525252] hover:text-[#E3E3E3] cursor-pointer transition-colors" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8 overflow-y-auto h-[calc(100vh-64px)]">
          {/* Main Header */}
          <div className="mb-8 pb-6 border-b border-[#2F2F2F]">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Overview</h1>
            <p className="text-[#9B9A97]">Global performance across all pipelines.</p>
          </div>

          <GlobalAnalyticsSnapshot activeCount={activePipelinesCount} />

          <div className="mt-8 space-y-8">
            {/* Selected Pipeline Detail */}
            {isLoadingDetails ? (
              <div className="h-64 flex items-center justify-center bg-[#191919] border border-[#2F2F2F] rounded-xl border-dashed">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                  <span className="text-zinc-500 text-sm">Loading pipeline details...</span>
                </div>
              </div>
            ) : selectedPipeline ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                {/* Header Summary Card */}
                {/* Header Summary Card */}
                {/* Header Summary Card */}
                <div className="rounded-xl border border-[#2F2F2F] bg-[#191919] p-8 relative overflow-hidden shadow-2xl">
                  {/* Dynamic color top border */}
                  <div
                    className="absolute top-0 left-0 w-full h-[2px] opacity-80"
                    style={{ background: selectedPipeline.color || '#333' }}
                  />

                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex flex-col gap-6 w-full">
                      <div className="flex items-center gap-6">
                        {selectedPipeline.image_url ? (
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#2F2F2F]">
                            <img
                              src={selectedPipeline.image_url}
                              alt={selectedPipeline.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className="p-3 rounded-xl bg-[#252525] border border-[#2F2F2F]"
                            style={{ color: selectedPipeline.color || 'white' }}
                          >
                            <Youtube className="w-8 h-8 font-current" />
                          </div>
                        )}
                        <div>
                          <h1 className="text-3xl font-bold text-white tracking-tight">
                            {selectedPipeline.name}
                          </h1>
                          <div className="flex items-center gap-3 mt-3">
                            {/* Status Badge */}
                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 shadow-sm backdrop-blur-sm">
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  selectedPipeline.status === 'CREATED' ||
                                  selectedPipeline.status === 'Running' ||
                                  selectedPipeline.status === 'active'
                                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                    : 'bg-zinc-500'
                                }`}
                              />
                              <span className="uppercase tracking-wider text-[10px]">
                                {selectedPipeline.status || 'DRAFT'}
                              </span>
                            </div>

                            {/* Type Badge */}
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 shadow-sm backdrop-blur-sm">
                              <Youtube className="w-3.5 h-3.5 text-zinc-400" />
                              <span className="capitalize">
                                {selectedPipeline.pipeline_type?.replace('_', ' ') || 'YouTube'}
                              </span>
                            </div>

                            {/* Mode Badge */}
                            {selectedPipeline.execution_mode && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 shadow-sm backdrop-blur-sm">
                                {selectedPipeline.execution_mode === 'scheduled' ? (
                                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                ) : (
                                  <Zap className="w-3.5 h-3.5 text-zinc-400" />
                                )}
                                <span className="capitalize">
                                  {selectedPipeline.execution_mode}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Title & Description Templates */}
                      {selectedPipeline.configuration && (
                        <div className="relative mt-2 pl-3">
                          {/* Vertical Line for Gradient Support */}
                          <div
                            className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full opacity-80"
                            style={{ background: selectedPipeline.color || '#333' }}
                          />

                          <div className="flex flex-col gap-4">
                            {selectedPipeline.configuration.metadata?.titleTemplate && (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-[#525252]">
                                  <Type className="w-3 h-3" />
                                  <span className="text-[10px] uppercase tracking-wider font-bold">
                                    Title Template
                                  </span>
                                </div>
                                <div className="group relative">
                                  <div className="px-4 py-3 rounded-lg border border-[#2F2F2F] bg-[#0A0A0A] text-[#E3E3E3] font-mono text-sm shadow-inner">
                                    {selectedPipeline.configuration.metadata.titleTemplate}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(
                                        selectedPipeline.configuration?.metadata?.titleTemplate ||
                                          '',
                                      );
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-[#252525] text-zinc-400 hover:text-white transition-all duration-200"
                                    title="Copy template"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                            {selectedPipeline.configuration.metadata?.descriptionTemplate && (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-[#525252]">
                                  <FileText className="w-3 h-3" />
                                  <span className="text-[10px] uppercase tracking-wider font-bold">
                                    Description Template
                                  </span>
                                </div>
                                <div className="group relative">
                                  <div className="px-4 py-3 rounded-lg border border-[#2F2F2F] bg-[#0A0A0A] text-[#E3E3E3] font-mono text-xs whitespace-pre-wrap shadow-inner leading-relaxed">
                                    {selectedPipeline.configuration.metadata.descriptionTemplate}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(
                                        selectedPipeline.configuration?.metadata
                                          ?.descriptionTemplate || '',
                                      );
                                    }}
                                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-[#252525] text-zinc-400 hover:text-white transition-all duration-200"
                                    title="Copy template"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                            {selectedPipeline.configuration.metadata?.tagsTemplate && (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-[#525252]">
                                  <Hash className="w-3 h-3" />
                                  <span className="text-[10px] uppercase tracking-wider font-bold">
                                    Tags Template
                                  </span>
                                </div>
                                <div className="group relative">
                                  <div className="px-4 py-3 rounded-lg border border-[#2F2F2F] bg-[#0A0A0A] text-[#E3E3E3] font-mono text-sm shadow-inner">
                                    {selectedPipeline.configuration.metadata.tagsTemplate}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(
                                        selectedPipeline.configuration?.metadata?.tagsTemplate ||
                                          '',
                                      );
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-[#252525] text-zinc-400 hover:text-white transition-all duration-200"
                                    title="Copy template"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3 shrink-0 ml-6">
                      {/* Run Pipeline & Settings */}
                      <div className="flex items-center gap-3">
                        <Button className="bg-white text-black hover:bg-zinc-200 transition-all font-semibold shadow-lg shadow-white/5 border border-transparent hover:border-zinc-300 h-10 px-6 font-medium group cursor-default">
                          <Play
                            className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"
                            style={{
                              fill: selectedPipeline.color?.includes('gradient')
                                ? 'black'
                                : selectedPipeline.color || 'black',
                              color: 'black',
                            }}
                          />{' '}
                          Run Pipeline
                        </Button>
                      </div>
                      {pipelineChannelDetails && (
                        <div className="flex items-center gap-2 text-xs text-[#9B9A97]">
                          {pipelineChannelDetails.thumbnails?.default?.url && (
                            <img
                              src={pipelineChannelDetails.thumbnails.default.url}
                              alt="Channel"
                              className="w-4 h-4 rounded-full"
                            />
                          )}
                          <span>{pipelineChannelDetails.title}</span>
                          <span className="text-[#333]">|</span>
                          <span>{pipelineChannelDetails.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detailed Configuration Grid */}
                {selectedPipeline.readiness && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-6">
                      {/* Readiness */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-[#525252] uppercase tracking-wider">
                          Readiness
                        </h3>
                        <div className="bg-[#191919] border border-[#2F2F2F] rounded-xl p-6 space-y-4">
                          {/* Readiness Score Removed as per request */}

                          <div className="space-y-3">
                            {[
                              {
                                key: 'sourceConfigured',
                                label: 'Source Configured',
                                icon: <Database className="w-4 h-4" />,
                                desc: 'Content source connected',
                              },
                              {
                                key: 'youtubeConnected',
                                label: 'Youtube Connected',
                                icon: <Youtube className="w-4 h-4" />,
                                desc: 'Channel authorization valid',
                              },
                              {
                                key: 'scheduleConfigured',
                                label: 'Schedule Configured',
                                icon: <Clock className="w-4 h-4" />,
                                desc: 'Upload frequency set',
                              },
                              {
                                key: 'adminLimitsApplied',
                                label: 'Admin Limits',
                                icon: <ShieldAlert className="w-4 h-4" />,
                                desc: 'Safety policies active',
                              },
                              {
                                key: 'verified',
                                label: 'Verified Status',
                                icon: <CheckCircle2 className="w-4 h-4" />,
                                desc: 'Pipeline ready to deploy',
                              },
                            ].map((item) => {
                              const isReady =
                                selectedPipeline.readiness?.[
                                  item.key as keyof typeof selectedPipeline.readiness
                                ];
                              return (
                                <div
                                  key={item.key}
                                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                    isReady
                                      ? 'bg-white/5 border-white/10'
                                      : 'bg-[#202020] border-[#2A2A2A]'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`p-1.5 rounded-md ${
                                        isReady
                                          ? 'text-white bg-white/10'
                                          : 'text-zinc-500 bg-[#2A2A2A]'
                                      }`}
                                    >
                                      {item.icon}
                                    </div>
                                    <div className="flex flex-col">
                                      <span
                                        className={`text-sm font-medium ${
                                          isReady ? 'text-zinc-200' : 'text-zinc-400'
                                        }`}
                                      >
                                        {item.label}
                                      </span>
                                      <span className="text-[10px] text-zinc-500">{item.desc}</span>
                                    </div>
                                  </div>
                                  {isReady ? (
                                    <Check className="w-4 h-4 text-white" />
                                  ) : (
                                    <X className="w-4 h-4 text-zinc-600" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-[#525252] uppercase tracking-wider">
                          Metadata
                        </h3>
                        <div className="bg-[#191919] border border-[#2F2F2F] rounded-xl p-6">
                          {selectedPipeline.metadata && (
                            <div className="space-y-3">
                              {/* Created At */}
                              <div className="flex items-center gap-4 p-3 rounded-lg bg-[#202020] border border-[#2A2A2A]">
                                <div className="p-2 rounded-full bg-[#2A2A2A] text-zinc-400">
                                  <Calendar className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] uppercase tracking-wider text-[#737373] font-bold">
                                    Created At
                                  </span>
                                  <span className="text-[#E3E3E3] text-xs font-mono mt-0.5">
                                    {new Date(selectedPipeline.metadata.createdAt).toLocaleString(
                                      undefined,
                                      {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                      },
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Last Updated */}
                              <div className="flex items-center gap-4 p-3 rounded-lg bg-[#202020] border border-[#2A2A2A]">
                                <div className="p-2 rounded-full bg-[#2A2A2A] text-zinc-400">
                                  <Clock className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] uppercase tracking-wider text-[#737373] font-bold">
                                    Last Updated
                                  </span>
                                  <span className="text-[#E3E3E3] text-xs font-mono mt-0.5">
                                    {new Date(selectedPipeline.metadata.updatedAt).toLocaleString(
                                      undefined,
                                      {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                      },
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Owner ID (if available, added for enrichment) */}
                              {selectedPipeline.metadata.ownerUserId && (
                                <div className="flex items-center gap-4 p-3 rounded-lg bg-[#202020] border border-[#2A2A2A]">
                                  <div className="p-2 rounded-full bg-[#2A2A2A] text-zinc-400">
                                    <User className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col flex-1">
                                    <span className="text-[10px] uppercase tracking-wider text-[#737373] font-bold">
                                      Owner
                                    </span>
                                    {/* Hidden ID */}
                                  </div>
                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowOwnerIdMenu(!showOwnerIdMenu);
                                      }}
                                      className="p-1 rounded hover:bg-[#2F2F2F] text-zinc-500 hover:text-white transition-colors"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                    {showOwnerIdMenu && (
                                      <div className="absolute right-0 top-8 z-50 bg-[#191919] border border-[#2F2F2F] rounded-md shadow-xl p-1 min-w-[160px]">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (selectedPipeline.metadata?.ownerUserId) {
                                              navigator.clipboard.writeText(
                                                selectedPipeline.metadata.ownerUserId,
                                              );
                                            }
                                            setShowOwnerIdMenu(false);
                                          }}
                                          className="flex items-center gap-2 w-full px-2 py-2 text-xs text-zinc-300 hover:text-white hover:bg-[#2F2F2F] rounded text-left transition-colors"
                                        >
                                          <Copy className="w-3 h-3" />
                                          Copy Owner ID
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Admin Limits */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-[#525252] uppercase tracking-wider">
                          Admin Limits
                        </h3>
                        <div className="bg-[#191919] border border-[#2F2F2F] rounded-xl p-6">
                          {selectedPipeline.adminLimits && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Execution Stats */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-zinc-400">
                                  <Zap className="w-4 h-4" />
                                  <span className="text-xs font-bold uppercase tracking-wider">
                                    Execution
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  <div className="bg-[#202020] p-3 rounded-lg border border-[#2A2A2A]">
                                    <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                                      Max Concurrent
                                    </div>
                                    <div className="text-white font-mono text-sm">
                                      {selectedPipeline.adminLimits.execution.maxConcurrentRuns}{' '}
                                      Runs
                                    </div>
                                  </div>
                                  <div className="bg-[#202020] p-3 rounded-lg border border-[#2A2A2A]">
                                    <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                                      Timeout
                                    </div>
                                    <div className="text-white font-mono text-sm">
                                      {selectedPipeline.adminLimits.execution.timeoutPerStepSeconds}
                                      s
                                    </div>
                                  </div>
                                  <div className="bg-[#202020] p-3 rounded-lg border border-[#2A2A2A]">
                                    <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                                      Retry limit
                                    </div>
                                    <div className="text-white font-mono text-sm flex items-center gap-2">
                                      <RotateCcw className="w-3 h-3 text-zinc-500" />
                                      {selectedPipeline.adminLimits.execution.retryCount}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Safety Stats */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-zinc-400">
                                  <Shield className="w-4 h-4" />
                                  <span className="text-xs font-bold uppercase tracking-wider">
                                    Safety
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <div className="bg-[#202020] p-3 rounded-lg border border-[#2A2A2A]">
                                    <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                                      On Failure
                                    </div>
                                    <div className="text-white font-mono text-xs uppercase bg-red-500/10 text-red-400 inline-block px-2 py-1 rounded">
                                      {selectedPipeline.adminLimits.safety.onFailureAction}
                                    </div>
                                  </div>
                                  <div className="bg-[#202020] p-3 rounded-lg border border-[#2A2A2A] flex items-center justify-between">
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold">
                                      Audit Trail
                                    </span>
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        selectedPipeline.adminLimits.safety.auditTrailEnabled
                                          ? 'bg-white'
                                          : 'bg-zinc-600'
                                      }`}
                                    />
                                  </div>
                                  <div className="bg-[#202020] p-3 rounded-lg border border-[#2A2A2A] flex items-center justify-between">
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold">
                                      Config Lock
                                    </span>
                                    <Lock
                                      className={`w-3 h-3 ${
                                        selectedPipeline.adminLimits.safety.locked
                                          ? 'text-white'
                                          : 'text-zinc-600'
                                      }`}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Configuration */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold text-[#525252] uppercase tracking-wider">
                        Configuration & Settings
                      </h3>
                      <div className="bg-[#191919] border border-[#2F2F2F] rounded-xl p-6 space-y-4">
                        {selectedPipeline.configuration && (
                          <div className="space-y-6">
                            {/* Workflow Group */}
                            <div>
                              <h4 className="text-[10px] uppercase tracking-wider text-[#525252] font-bold mb-3 pl-1">
                                Workflow Settings
                              </h4>
                              <div className="bg-[#202020] rounded-lg border border-[#2A2A2A] overflow-hidden">
                                {/* Content Source */}
                                <div className="flex items-center justify-between p-3 border-b border-[#2A2A2A]">
                                  <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-md bg-[#2A2A2A] text-zinc-400">
                                      <Database className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm text-zinc-400">Content Source</span>
                                  </div>
                                  <span className="text-[#E3E3E3] text-sm font-medium font-mono text-right capitalize">
                                    {selectedPipeline.configuration.contentSource}
                                  </span>
                                </div>

                                {/* Schedule */}
                                {selectedPipeline.execution_mode !== 'manual' && (
                                  <div className="flex items-center justify-between p-3 border-b border-[#2A2A2A]">
                                    <div className="flex items-center gap-3">
                                      <div className="p-1.5 rounded-md bg-[#2A2A2A] text-zinc-400">
                                        <Clock className="w-4 h-4" />
                                      </div>
                                      <span className="text-sm text-zinc-400">Schedule</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-[#E3E3E3] text-xs font-mono">
                                        {selectedPipeline.configuration.schedule?.frequency}
                                      </div>
                                      <div className="text-zinc-500 text-[10px]">
                                        {selectedPipeline.configuration.schedule?.timezone}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Approval Flow */}
                                <div className="flex items-center justify-between p-3">
                                  <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-md bg-[#2A2A2A] text-zinc-400">
                                      <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <div className="relative group">
                                      <span className="text-sm text-zinc-400 cursor-help border-b border-dotted border-zinc-600">
                                        Approval Flow
                                      </span>

                                      {/* Hover Tooltip for Stages */}
                                      {selectedPipeline.configuration.approvalFlow?.stages?.length >
                                        0 &&
                                        selectedPipeline.configuration.approvalFlow.enabled && (
                                          <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-[#111] border border-[#333] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">
                                              Flow Stages
                                            </p>
                                            <div className="space-y-1.5">
                                              {selectedPipeline.configuration.approvalFlow.stages.map(
                                                (stage, idx) => (
                                                  <div
                                                    key={idx}
                                                    className="flex items-center gap-2 text-xs text-zinc-300"
                                                  >
                                                    <div className="w-4 h-4 rounded-full bg-[#222] flex items-center justify-center text-[9px] font-mono text-zinc-500 border border-[#333]">
                                                      {idx + 1}
                                                    </div>
                                                    {stage}
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                  <span
                                    className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border ${
                                      selectedPipeline.configuration.approvalFlow.enabled
                                        ? 'bg-white/10 border-white/20 text-white'
                                        : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-500'
                                    }`}
                                  >
                                    {selectedPipeline.configuration.approvalFlow.enabled
                                      ? 'Enabled'
                                      : 'Disabled'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* User Allocation Group */}
                            {selectedPipeline.adminLimits && (
                              <div className="mt-6">
                                <h4 className="text-[10px] uppercase tracking-wider text-[#525252] font-bold mb-3 pl-1">
                                  User Allocation
                                </h4>
                                <div className="bg-[#202020] rounded-lg border border-[#2A2A2A] overflow-hidden">
                                  {/* Total Allocated Storage */}
                                  <div className="flex items-center justify-between p-3 border-b border-[#2A2A2A]">
                                    <div className="flex items-center gap-3">
                                      <div className="p-1.5 rounded-md bg-[#2A2A2A] text-zinc-400">
                                        <HardDrive className="w-4 h-4" />
                                      </div>
                                      <span className="text-sm text-zinc-400">
                                        Total Allocated Storage
                                      </span>
                                    </div>
                                    <span className="text-[#E3E3E3] text-sm font-medium font-mono text-right">
                                      {selectedPipeline.adminLimits.resources.storageMB >= 1024
                                        ? `${(
                                            selectedPipeline.adminLimits.resources.storageMB / 1024
                                          ).toFixed(1)} GB`
                                        : `${selectedPipeline.adminLimits.resources.storageMB} MB`}
                                    </span>
                                  </div>

                                  {/* Max File Size (Memory MB) */}
                                  <div className="flex items-center justify-between p-3 border-b border-[#2A2A2A]">
                                    <div className="flex items-center gap-3">
                                      <div className="p-1.5 rounded-md bg-[#2A2A2A] text-zinc-400">
                                        <FileText className="w-4 h-4" />
                                      </div>
                                      <span className="text-sm text-zinc-400">Max File Size</span>
                                    </div>
                                    <span className="text-[#E3E3E3] text-sm font-medium font-mono text-right">
                                      {selectedPipeline.adminLimits.resources.memoryMB >= 1024
                                        ? `${(
                                            selectedPipeline.adminLimits.resources.memoryMB / 1024
                                          ).toFixed(1)} GB`
                                        : `${selectedPipeline.adminLimits.resources.memoryMB} MB`}
                                    </span>
                                  </div>

                                  {/* Daily Upload Quota */}
                                  <div className="flex items-center justify-between p-3 border-b border-[#2A2A2A]">
                                    <div className="flex items-center gap-3">
                                      <div className="p-1.5 rounded-md bg-[#2A2A2A] text-zinc-400">
                                        <Activity className="w-4 h-4" />
                                      </div>
                                      <span className="text-sm text-zinc-400">
                                        Daily Upload Quota
                                      </span>
                                    </div>
                                    <span className="text-[#E3E3E3] text-sm font-medium font-mono text-right">
                                      {selectedPipeline.adminLimits.resources.dailyUploads} Videos
                                    </span>
                                  </div>

                                  {/* CPU Limit */}
                                  <div className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-3">
                                      <div className="p-1.5 rounded-md bg-[#2A2A2A] text-zinc-400">
                                        <Cpu className="w-4 h-4" />
                                      </div>
                                      <span className="text-sm text-zinc-400">CPU Allocation</span>
                                    </div>
                                    <span className="text-[#E3E3E3] text-sm font-medium font-mono text-right">
                                      {selectedPipeline.adminLimits.resources.cpu} vCPU
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* YouTube Settings Group */}
                            {selectedPipeline.configuration.youtube && (
                              <div>
                                <h4 className="text-[10px] uppercase tracking-wider text-[#525252] font-bold mb-3 pl-1">
                                  YouTube Configuration
                                </h4>
                                <div className="bg-[#202020] rounded-lg border border-[#2A2A2A] overflow-hidden">
                                  {/* Channel ID (Safe Copy) */}
                                  <div className="flex items-center justify-between p-3 border-b border-[#2A2A2A]">
                                    <div className="flex items-center gap-3">
                                      <div className="p-1.5 rounded-md bg-[#2A2A2A] text-zinc-400">
                                        <Youtube className="w-4 h-4" />
                                      </div>
                                      <span className="text-sm text-zinc-400">Channel ID</span>
                                    </div>

                                    <div className="relative">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowChannelIdMenu(!showChannelIdMenu);
                                        }}
                                        className="p-1 rounded hover:bg-[#2F2F2F] text-zinc-500 hover:text-white transition-colors"
                                      >
                                        <MoreHorizontal className="w-4 h-4" />
                                      </button>
                                      {showChannelIdMenu && (
                                        <div className="absolute right-0 top-8 z-50 bg-[#191919] border border-[#2F2F2F] rounded-md shadow-xl p-1 min-w-[160px]">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (
                                                selectedPipeline.configuration?.youtube?.channelId
                                              ) {
                                                navigator.clipboard.writeText(
                                                  selectedPipeline.configuration.youtube.channelId,
                                                );
                                              }
                                              setShowChannelIdMenu(false);
                                            }}
                                            className="flex items-center gap-2 w-full px-2 py-2 text-xs text-zinc-300 hover:text-white hover:bg-[#2F2F2F] rounded text-left transition-colors"
                                          >
                                            <Copy className="w-3 h-3" />
                                            Copy Channel ID
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Category */}
                                  <div className="flex items-center justify-between p-3 border-b border-[#2A2A2A]">
                                    <div className="flex items-center gap-3">
                                      <div className="p-1.5 rounded-md bg-[#2A2A2A] text-zinc-400">
                                        <Video className="w-4 h-4" />
                                      </div>
                                      <span className="text-sm text-zinc-400">Category</span>
                                    </div>
                                    <span className="text-[#E3E3E3] text-sm font-medium text-right">
                                      {selectedPipeline.configuration.youtube.category}
                                    </span>
                                  </div>

                                  {/* Privacy */}
                                  <div className="flex items-center justify-between p-3 border-b border-[#2A2A2A]">
                                    <div className="flex items-center gap-3">
                                      <div className="p-1.5 rounded-md bg-[#2A2A2A] text-zinc-400">
                                        <ShieldAlert className="w-4 h-4" />
                                      </div>
                                      <span className="text-sm text-zinc-400">Privacy</span>
                                    </div>
                                    <span className="text-[#E3E3E3] text-sm font-medium capitalize text-right">
                                      {selectedPipeline.configuration.youtube.privacy}
                                    </span>
                                  </div>

                                  {/* Made For Kids */}
                                  <div className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-3">
                                      <div className="p-1.5 rounded-md bg-[#2A2A2A] text-zinc-400">
                                        <Baby className="w-4 h-4" />
                                      </div>
                                      <span className="text-sm text-zinc-400">Made For Kids</span>
                                    </div>
                                    <span className="text-[#E3E3E3] text-sm font-medium text-right">
                                      {selectedPipeline.configuration.youtube.madeForKids
                                        ? 'Yes'
                                        : 'No'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Metadata / Targeting Group */}
                            <div>
                              <h4 className="text-[10px] uppercase tracking-wider text-[#525252] font-bold mb-3 pl-1">
                                Targeting
                              </h4>
                              <div className="bg-[#202020] rounded-lg border border-[#2A2A2A] overflow-hidden flex divide-x divide-[#2A2A2A]">
                                <div className="flex-1 flex flex-col items-center justify-center p-3 gap-2">
                                  <Globe className="w-4 h-4 text-zinc-500" />
                                  <div className="text-center">
                                    <div className="text-[10px] text-zinc-500 uppercase font-bold">
                                      Language
                                    </div>
                                    <div className="text-[#E3E3E3] text-xs font-mono mt-0.5">
                                      {selectedPipeline.configuration.metadata?.language || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-center p-3 gap-2">
                                  <Globe className="w-4 h-4 text-zinc-500" />
                                  <div className="text-center">
                                    <div className="text-[10px] text-zinc-500 uppercase font-bold">
                                      Region
                                    </div>
                                    <div className="text-[#E3E3E3] text-xs font-mono mt-0.5">
                                      {selectedPipeline.configuration.metadata?.region || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#191919] p-12 rounded-xl border border-[#2F2F2F] border-dashed min-h-[400px] flex flex-col items-center justify-center text-[#9B9A97] gap-4">
                <div className="p-4 rounded-full bg-[#252525]">
                  <Search className="w-8 h-8 text-[#525252]" />
                </div>
                <p>Select a pipeline from the sidebar to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Floating Assistant Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="group flex items-center p-1 bg-[#E5E5E5] hover:bg-white text-black rounded-full shadow-2xl transition-all duration-300 ease-out hover:pr-4 border border-zinc-200">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent">
            <Bot className="w-6 h-6 stroke-[1.5]" />
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out whitespace-nowrap text-sm font-semibold opacity-0 group-hover:opacity-100 pl-0 group-hover:pl-2">
            Zylo AI
          </span>
        </button>
      </div>
      <PipelineAdvancedSettingsModal
        isOpen={isAdvancedSettingsOpen}
        onClose={() => setIsAdvancedSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialSettings={advancedSettings}
        initialTab="approval"
        onAutoSave={handleSaveSettings}
      />
      <AnimatePresence>
        {isTrashModalOpen && (
          <>
            {/* Invisible backdrop to close on click outside */}
            <div className="fixed inset-0 z-[90]" onClick={() => setIsTrashModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed bottom-14 left-[270px] z-[100] w-[400px] h-[450px] bg-[#191919] border border-[#333] rounded-lg shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header with Search (Visual only per screenshot style) */}
              <div className="p-3 border-b border-[#2F2F2F]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search pipelines in Trash"
                    className="w-full bg-[#202020] border border-[#333] rounded px-3 py-1.5 pl-8 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                  <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-600" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#252525] border border-[#2F2F2F] text-[10px] text-zinc-400 cursor-pointer hover:text-zinc-300">
                    <User className="w-3 h-3" />
                    Last edited by
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#252525] border border-[#2F2F2F] text-[10px] text-zinc-400 cursor-pointer hover:text-zinc-300">
                    <SquareCheck className="w-3 h-3" />
                    In
                  </div>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {trashedPipelines.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-3">
                    <Trash2 className="w-8 h-8 opacity-20" />
                    <span className="text-sm font-medium">No results</span>
                  </div>
                ) : (
                  <div className="p-1 space-y-0.5">
                    {trashedPipelines.map((pipeline, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded hover:bg-[#252525] group transition-colors"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="w-5 h-5 rounded flex items-center justify-center text-zinc-500 flex-shrink-0">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm text-[#E3E3E3] truncate">{pipeline.name}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleRestore(pipeline.name)}
                            className="p-1.5 rounded hover:bg-[#333] text-zinc-500 hover:text-white transition-colors"
                            title="Restore"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteForever(pipeline.name)}
                            className={`p-1.5 rounded transition-colors ${
                              confirmDeleteId === pipeline.name
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'hover:bg-[#333] text-zinc-500 hover:text-red-400'
                            }`}
                            title={
                              confirmDeleteId === pipeline.name
                                ? 'Click again to confirm delete'
                                : 'Delete Permanently'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-[#2F2F2F] bg-[#191919]">
                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500">
                  <span>Pages in Trash for over 30 days will be automatically deleted</span>
                  <HelpCircle className="w-3 h-3 opacity-50" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {createPortal(
        <AnimatePresence>
          {isErrorModalOpen && automationErrorData && (
            <motion.div
              key="automation-error-toast"
              initial={{ opacity: 0, y: 20, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, x: 20, scale: 0.95 }}
              className="fixed bottom-24 right-8 z-[1000] flex flex-col items-end pointer-events-none"
            >
              <div className="w-[400px] bg-[#191919] border border-red-500/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden pointer-events-auto ring-1 ring-red-500/20">
                {/* Header */}
                <div className="p-4 border-b border-[#2F2F2F] flex items-center justify-between bg-[#202020]/50 backdrop-blur-sm">
                  <h3 className="text-white font-semibold flex items-center gap-2.5 text-sm">
                    <div className="p-1.5 bg-red-500/10 rounded-md">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    {automationErrorData.message}
                  </h3>
                  <button
                    onClick={() => setIsErrorModalOpen(false)}
                    className="p-1 rounded hover:bg-[#333] text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 bg-[#191919]">
                  <div className="text-xs text-zinc-400">
                    Automation cannot be started due to the following issues:
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {automationErrorData.reasons.map((reason, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg text-xs text-red-200"
                      >
                        <div className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span className="leading-relaxed opacity-90">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {isSuccessModalOpen && automationSuccessData && (
            <motion.div
              key="automation-success-toast"
              initial={{ opacity: 0, y: 20, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, x: 20, scale: 0.95 }}
              className="fixed bottom-24 right-8 z-[1000] flex flex-col items-end pointer-events-none"
            >
              <div className="w-[400px] bg-[#191919] border border-emerald-500/20 rounded-xl shadow-2xl shadow-emerald-900/10 overflow-hidden pointer-events-auto ring-1 ring-emerald-500/20">
                <div className="p-4 flex items-center gap-3 bg-[#202020]/50 backdrop-blur-sm">
                  <div className="p-2 bg-emerald-500/10 rounded-full shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-sm">Success</h3>
                    <p className="text-zinc-400 text-xs mt-0.5">{automationSuccessData.message}</p>
                  </div>
                  <button
                    onClick={() => setIsSuccessModalOpen(false)}
                    className="p-1 rounded hover:bg-[#333] text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          {isStartingAutomation && (
            <motion.div
              key="loading-overlay"
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm cursor-wait"
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}

export function YtPipelineDashboard() {
  return (
    <PipelineWizardProvider>
      <DashboardContent />
    </PipelineWizardProvider>
  );
}
