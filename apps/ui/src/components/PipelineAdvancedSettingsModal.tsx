import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, Reorder } from 'framer-motion';
import {
  X,
  CheckCircle2,
  ChevronDown,
  Shield,
  Zap,
  Activity,
  Bell,
  Lock,
  GripVertical,
  Save,
  AlertTriangle,
  RotateCcw,
  Clock,
  Check,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import {
  type AdvancedSettings,
  ConfiguredBy,
  OnFailureAction,
} from './PipelineAdvancedSettingsModels';

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AdvancedSettings) => void;
  initialSettings: AdvancedSettings;
  initialTab?: string;
  onAutoSave?: (settings: AdvancedSettings) => void;
}

const TABS = [
  { id: 'approval', label: 'Approval Flow', icon: CheckCircle2 },
  { id: 'limits', label: 'Execution Limits', icon: Zap },
  { id: 'events', label: 'Events & Integrations', icon: Bell },
  { id: 'safety', label: 'Safety Controls', icon: Shield },
  { id: 'observability', label: 'Observability', icon: Activity },
];

export function PipelineAdvancedSettingsModal({
  isOpen,
  onClose,
  onSave,
  initialSettings,
  initialTab = 'approval',
  onAutoSave,
}: AdvancedSettingsModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update active tab if initialTab changes while open (optional, but good for direct linking)
  // Track previous prop values to detect changes during render
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);

  // Update active tab synchronously if initialTab/isOpen changes
  if (isOpen !== prevIsOpen || initialTab !== prevInitialTab) {
    setPrevIsOpen(isOpen);
    setPrevInitialTab(initialTab);
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }

  const [localSettings, setLocalSettings] = useState<AdvancedSettings>(initialSettings);
  const [stages, setStages] = useState(initialSettings.approvalFlow.stages);

  useEffect(() => {
    setLocalSettings(initialSettings);
    setStages(initialSettings.approvalFlow.stages);
  }, [initialSettings]);

  // Sync stages with localSettings when dragging ends or order changes
  const handleReorder = (newOrder: string[]) => {
    setStages(newOrder);
    setLocalSettings((prev) => ({
      ...prev,
      approvalFlow: {
        ...prev.approvalFlow,
        stages: newOrder,
      },
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Auto-save logic for Execution Limits
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only trigger if specifically on limits tab or if requirements state "whenever changed" -
    // user specified "when the user change something on execution limit page".
    // We can filter by activeTab or just listen to executionLimits changes generally.
    // Given the request, "on execution limit page" implies active interaction.
    if (activeTab === 'limits' && isOpen && onAutoSave) {
      const timer = setTimeout(() => {
        onAutoSave(localSettings);
      }, 800); // 800ms debounce
      return () => clearTimeout(timer);
    }
  }, [localSettings.executionLimits, activeTab, isOpen, onAutoSave]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-[#191919] border border-[#333333] rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden lg:h-[700px]"
      >
        {/* Sidebar */}
        <div className="w-64 border-r border-[#333333] bg-[#191919] flex flex-col">
          <div className="p-6 border-b border-[#333333]">
            <h2 className="text-lg font-bold text-white tracking-tight">Settings</h2>
            <p className="text-xs text-zinc-500 mt-1">Advanced pipeline config</p>
          </div>
          <div className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-black shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#2F2F2F]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="p-4 border-t border-[#333333]">
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 bg-[#2F2F2F]/50 p-2 rounded">
              <Lock className="w-3 h-3" />
              <span>Admin access only</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-[#191919]">
          {/* Header */}
          <div className="h-16 border-b border-[#333333] flex items-center justify-between px-8 bg-[#191919]">
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2">
                {TABS.find((t) => t.id === activeTab)?.label}
                {activeTab === 'observability' && (
                  <span className="text-[10px] bg-[#2F2F2F] px-1.5 py-0.5 rounded text-zinc-400 font-normal">
                    Read Only
                  </span>
                )}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#2F2F2F] rounded-full text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl">
              {/* TAB: APPROVAL FLOW */}
              {activeTab === 'approval' && (
                <div className="space-y-8">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-zinc-200">
                        Enable Approval Workflow
                      </label>
                      <p className="text-xs text-zinc-500">
                        Require manual approval at specific stages before execution proceeds.
                      </p>
                      {localSettings.approvalFlow.enabled && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 px-2.5 py-1.5 rounded border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          Pipeline will not execute until all stages approve.
                        </div>
                      )}
                    </div>
                    <Switch
                      checked={localSettings.approvalFlow.enabled}
                      onChange={(c) =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          approvalFlow: { ...prev.approvalFlow, enabled: c },
                        }))
                      }
                    />
                  </div>

                  {localSettings.approvalFlow.enabled && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between text-xs text-zinc-500 uppercase font-bold tracking-wider">
                        <span>Approval Chain Order</span>
                        <span className="text-[10px] font-normal normal-case opacity-70">
                          Drag to reorder
                        </span>
                      </div>

                      <Reorder.Group
                        axis="y"
                        values={stages}
                        onReorder={handleReorder}
                        className="space-y-2"
                      >
                        {stages.map((stage) => (
                          <Reorder.Item key={stage} value={stage}>
                            <div className="bg-[#202020] border border-[#333333] p-3 rounded-lg flex items-center gap-3 cursor-grab active:cursor-grabbing hover:border-zinc-600 transition-colors group">
                              <GripVertical className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                              <div className="p-1.5 bg-[#2F2F2F] rounded text-zinc-300">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium text-zinc-200">{stage}</span>
                              <div className="ml-auto text-[10px] bg-[#2F2F2F] text-zinc-500 px-2 py-0.5 rounded">
                                Required
                              </div>
                            </div>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: EXECUTION LIMITS */}
              {activeTab === 'limits' && (
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#202020] border border-[#333333]">
                      <div>
                        <span className="text-sm font-medium text-zinc-200 block">
                          Configured By
                        </span>
                        <span className="text-xs text-zinc-500">
                          Entity responsible for these settings
                        </span>
                      </div>
                      <div className="relative">
                        <select
                          value={localSettings.executionLimits.configuredBy}
                          onChange={(e) =>
                            setLocalSettings((prev) => ({
                              ...prev,
                              executionLimits: {
                                ...prev.executionLimits,
                                configuredBy: e.target.value as ConfiguredBy,
                              },
                            }))
                          }
                          className="appearance-none bg-[#2F2F2F] hover:bg-[#3F3F3F] text-xs font-mono font-bold uppercase tracking-wider text-blue-400 border border-blue-500/20 rounded-md py-1.5 pl-3 pr-8 cursor-pointer focus:outline-none focus:border-blue-500/50 transition-colors"
                        >
                          <option value={ConfiguredBy.SYSTEM}>System</option>
                          <option value={ConfiguredBy.ADMIN}>Admin</option>
                          <option value={ConfiguredBy.USER}>User</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <ChevronDown className="w-3 h-3 text-blue-400 opacity-50" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup
                        label="Max Concurrent Runs"
                        description="Maximum number of parallel executions allowed."
                        value={localSettings.executionLimits.maxConcurrentRuns}
                        suffix="runs"
                        onChange={(v) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            executionLimits: {
                              ...prev.executionLimits,
                              maxConcurrentRuns: Number(v),
                            },
                          }))
                        }
                      />
                      <InputGroup
                        label="Max Daily Uploads"
                        description="Hard cap on YouTube API upload quota consumption."
                        value={localSettings.executionLimits.maxDailyUploads}
                        suffix="uploads"
                        onChange={(v) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            executionLimits: {
                              ...prev.executionLimits,
                              maxDailyUploads: Number(v),
                            },
                          }))
                        }
                      />
                      <InputGroup
                        label="Max File Size"
                        description="Reject files larger than this limit before processing."
                        value={localSettings.executionLimits.maxFileSizeMB}
                        suffix="MB"
                        onChange={(v) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            executionLimits: {
                              ...prev.executionLimits,
                              maxFileSizeMB: Number(v),
                            },
                          }))
                        }
                      />
                      <InputGroup
                        label="Total Storage Quota"
                        description="Total storage allocated for all pipeline artifacts."
                        value={localSettings.executionLimits.totalStorageMB}
                        suffix="MB"
                        onChange={(v) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            executionLimits: {
                              ...prev.executionLimits,
                              totalStorageMB: Number(v),
                            },
                          }))
                        }
                      />
                      <InputGroup
                        label="Timeout Per Step"
                        description="Max duration for a single step (10-3600s)."
                        value={localSettings.executionLimits.timeoutPerStepSeconds}
                        suffix="sec"
                        onChange={(v) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            executionLimits: {
                              ...prev.executionLimits,
                              timeoutPerStepSeconds: Number(v),
                            },
                          }))
                        }
                      />
                      <InputGroup
                        label="Auto Disable"
                        description="Disable pipeline after N consecutive failures."
                        value={localSettings.executionLimits.autoDisableAfterFailures}
                        suffix="fails"
                        onChange={(v) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            executionLimits: {
                              ...prev.executionLimits,
                              autoDisableAfterFailures: Number(v),
                            },
                          }))
                        }
                      />
                      <InputGroup
                        label="CPU Limit"
                        description="Allocated CPU cores (0.25 - 8)."
                        value={localSettings.executionLimits.cpuLimit}
                        suffix="cores"
                        onChange={(v) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            executionLimits: {
                              ...prev.executionLimits,
                              cpuLimit: Number(v),
                            },
                          }))
                        }
                      />
                      <InputGroup
                        label="Retry Count"
                        description="Auto-retries on failure (0-5)."
                        value={localSettings.executionLimits.retryCount}
                        suffix="retries"
                        onChange={(v) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            executionLimits: {
                              ...prev.executionLimits,
                              retryCount: Number(v),
                            },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="bg-[#202020] p-4 rounded-lg border border-[#333333]">
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase mb-3">
                      Current Usage
                    </h4>
                    <div className="flex gap-4">
                      <div className="flex-1 p-3 bg-[#191919] rounded border border-[#333333]">
                        <span className="text-xs text-zinc-500 block mb-1">Today's Uploads</span>
                        <span className="text-sm font-mono text-white">
                          12{' '}
                          <span className="text-zinc-600">
                            / {localSettings.executionLimits.maxDailyUploads}
                          </span>
                        </span>
                      </div>
                      <div className="flex-1 p-3 bg-[#191919] rounded border border-[#333333]">
                        <span className="text-xs text-zinc-500 block mb-1">Active Runs</span>
                        <span className="text-sm font-mono text-white">
                          2{' '}
                          <span className="text-zinc-600">
                            / {localSettings.executionLimits.maxConcurrentRuns}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: EVENTS */}
              {activeTab === 'events' && (
                <div className="space-y-8">
                  <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-lg flex gap-3 text-sm text-blue-400 mb-6">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>
                      Event failures (e.g., webhook timeouts) will not pause or stop the main
                      pipeline execution.
                    </p>
                  </div>

                  {/* Webhooks */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-zinc-400" /> Webhooks
                    </h4>
                    <div className="space-y-4">
                      <SettingInput
                        label="On Success Webhook"
                        desc="URL to call when pipeline execution succeeds."
                        value={localSettings.events.onSuccessWebhook}
                        onChange={(v) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            events: { ...prev.events, onSuccessWebhook: v as string },
                          }))
                        }
                        icon={CheckCircle2}
                        placeholder="https://api.example.com/webhook/success"
                      />

                      <SettingInput
                        label="On Failure Webhook"
                        desc="URL to call when pipeline execution fails."
                        value={localSettings.events.onFailureWebhook}
                        onChange={(v) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            events: { ...prev.events, onFailureWebhook: v as string },
                          }))
                        }
                        icon={AlertTriangle}
                        placeholder="https://api.example.com/webhook/failure"
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <SettingInput
                          label="Webhook Timeout"
                          desc="Max time to wait for webhook response (seconds)."
                          value={localSettings.events.webhookSettings?.timeoutSeconds || 30}
                          onChange={(v) =>
                            setLocalSettings((prev) => ({
                              ...prev,
                              events: {
                                ...prev.events,
                                webhookSettings: {
                                  timeoutSeconds: parseInt(v as string) || 30,
                                  behavior: prev.events.webhookSettings?.behavior || {
                                    nonBlocking: true,
                                  },
                                },
                              },
                            }))
                          }
                          icon={Clock}
                          type="number"
                        />

                        <div
                          className="flex items-center justify-between p-3 rounded-lg bg-[#202020] border border-[#333333] hover:border-[#444] transition-colors cursor-pointer group select-none"
                          onClick={() => {
                            const current =
                              localSettings.events.webhookSettings?.behavior?.nonBlocking ?? true;
                            setLocalSettings((prev) => ({
                              ...prev,
                              events: {
                                ...prev.events,
                                webhookSettings: {
                                  timeoutSeconds: prev.events.webhookSettings?.timeoutSeconds || 30,
                                  behavior: { nonBlocking: !current },
                                },
                              },
                            }));
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1 p-1.5 bg-[#2F2F2F] rounded text-zinc-400 group-hover:text-zinc-200 transition-colors">
                              <Zap className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-zinc-200 block group-hover:text-white transition-colors">
                                Non-Blocking Webhooks
                              </span>
                              <span className="text-xs text-zinc-500 max-w-[200px] block mt-0.5">
                                Continue pipeline execution without waiting for webhook response.
                              </span>
                            </div>
                          </div>
                          <Switch
                            checked={
                              localSettings.events.webhookSettings?.behavior?.nonBlocking ?? true
                            }
                            onChange={(c) => {
                              // Duplicate logic because Switch has stopPropagation
                              setLocalSettings((prev) => ({
                                ...prev,
                                events: {
                                  ...prev.events,
                                  webhookSettings: {
                                    timeoutSeconds:
                                      prev.events.webhookSettings?.timeoutSeconds || 30,
                                    behavior: { nonBlocking: c },
                                  },
                                },
                              }));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-[#333333]">
                      <button className="px-3 py-2 bg-[#2F2F2F] text-zinc-400 hover:text-white rounded-md text-xs font-medium transition-colors">
                        Test
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-px bg-[#333333]" />

                  {/* Alerts */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-zinc-400" /> Instant Alerts
                    </h4>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#202020] border border-[#333333]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-5 h-5">
                            <path
                              fill="#E01E5A"
                              d="M6 15a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2h2v2zm1 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-5z"
                            />
                            <path
                              fill="#36C5F0"
                              d="M11 6a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2v2h-2zm0 1a2 2 0 0 1 2 2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5z"
                            />
                            <path
                              fill="#2EB67D"
                              d="M18 11a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-2h2zm-1 0a2 2 0 0 1-2 2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5z"
                            />
                            <path
                              fill="#ECB22E"
                              d="M13 18a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-2h2zm0-1a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-5z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-zinc-200">
                            Slack Notifications
                          </div>
                          {localSettings.events.alerts.slack.enabled && (
                            <input
                              type="text"
                              placeholder="Webhook URL"
                              value={localSettings.events.alerts.slack.webhook}
                              onChange={(e) =>
                                setLocalSettings((prev) => ({
                                  ...prev,
                                  events: {
                                    ...prev.events,
                                    alerts: {
                                      ...prev.events.alerts,
                                      slack: {
                                        ...prev.events.alerts.slack,
                                        webhook: e.target.value,
                                      },
                                    },
                                  },
                                }))
                              }
                              className="mt-2 bg-black/50 border border-[#333333] rounded px-2 py-1 text-xs text-white w-full max-w-[200px]"
                            />
                          )}
                        </div>
                      </div>
                      <Switch
                        checked={localSettings.events.alerts.slack.enabled}
                        onChange={(c) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            events: {
                              ...prev.events,
                              alerts: {
                                ...prev.events.alerts,
                                slack: { ...prev.events.alerts.slack, enabled: c },
                              },
                            },
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#202020] border border-[#333333]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#5865F2] flex items-center justify-center text-white">
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-zinc-200">
                            Discord Notifications
                          </div>
                          {localSettings.events.alerts.discord.enabled && (
                            <input
                              type="text"
                              placeholder="Webhook URL"
                              value={localSettings.events.alerts.discord.webhook}
                              onChange={(e) =>
                                setLocalSettings((prev) => ({
                                  ...prev,
                                  events: {
                                    ...prev.events,
                                    alerts: {
                                      ...prev.events.alerts,
                                      discord: {
                                        ...prev.events.alerts.discord,
                                        webhook: e.target.value,
                                      },
                                    },
                                  },
                                }))
                              }
                              className="mt-2 bg-black/50 border border-[#333333] rounded px-2 py-1 text-xs text-white w-full max-w-[200px]"
                            />
                          )}
                        </div>
                      </div>
                      <Switch
                        checked={localSettings.events.alerts.discord.enabled}
                        onChange={(c) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            events: {
                              ...prev.events,
                              alerts: {
                                ...prev.events.alerts,
                                discord: { ...prev.events.alerts.discord, enabled: c },
                              },
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: OBSERVABILITY */}
              {activeTab === 'observability' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <StatCard
                      label="Total Runs"
                      value={localSettings.observability?.totalRuns || 0}
                      icon={Activity}
                    />
                    <StatCard
                      label="Successful"
                      value={localSettings.observability?.successfulRuns || 0}
                      icon={CheckCircle2}
                    />
                    <StatCard
                      label="Failed"
                      value={localSettings.observability?.failedRuns || 0}
                      icon={AlertCircle}
                    />
                  </div>

                  <div className="bg-[#202020] border border-[#333333] rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#333333] text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Timeline history
                    </div>
                    <div className="divide-y divide-[#333333]">
                      <TimelineRow
                        label="Last Run"
                        time={localSettings.observability?.lastRunAt}
                        icon={Clock}
                      />
                      <TimelineRow
                        label="Last Success"
                        time={localSettings.observability?.lastSuccessAt}
                        icon={Check}
                      />
                      <TimelineRow
                        label="Last Failure"
                        time={localSettings.observability?.lastFailureAt}
                        icon={X}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SAFETY */}
              {activeTab === 'safety' && (
                <div className="space-y-6">
                  <SafetyToggle
                    title="Configuration Lock"
                    desc="Prevent changes to Settings and Pipeline Structure while running."
                    checked={localSettings.safety.configLock}
                    onChange={(c) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        safety: { ...prev.safety, configLock: c },
                      }))
                    }
                    icon={Lock}
                  />
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#202020] border border-[#333333]">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-1.5 bg-[#2F2F2F] rounded text-zinc-400">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-zinc-200 block">
                          On Failure Action
                        </span>
                        <span className="text-xs text-zinc-500 max-w-[300px] block mt-0.5">
                          Determine how the pipeline behaves when an execution fails.
                        </span>
                      </div>
                    </div>
                    <div className="relative min-w-[180px]">
                      <select
                        value={localSettings.safety.onFailureAction}
                        onChange={(e) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            safety: {
                              ...prev.safety,
                              onFailureAction: e.target.value as OnFailureAction,
                            },
                          }))
                        }
                        className="w-full appearance-none bg-[#2F2F2F] hover:bg-[#3F3F3F] text-xs font-mono font-medium text-white border border-[#333333] rounded-md py-2 pl-3 pr-8 cursor-pointer focus:outline-none focus:border-zinc-500 transition-colors capitalize"
                      >
                        {Object.values(OnFailureAction).map((action) => (
                          <option key={action} value={action}>
                            {action.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                      </div>
                    </div>
                  </div>
                  <SafetyToggle
                    title="Audit Trail"
                    desc="Log all configuration changes and manual execution triggers to a secure immutable log."
                    checked={localSettings.safety.auditTrail}
                    onChange={(c) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        safety: { ...prev.safety, auditTrail: c },
                      }))
                    }
                    icon={Shield}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="h-20 border-t border-[#333333] bg-[#191919] flex items-center justify-between px-8 shrink-0">
            <div className="text-xs text-zinc-500">Last edited minutes ago</div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-sm font-bold shadow-lg shadow-white/5 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

// Sub-components
function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange?.(!checked);
      }}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
        checked
          ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)] border-transparent'
          : 'bg-[#333333] border-transparent hover:bg-[#404040]'
      }`}
    >
      <motion.div
        initial={false}
        animate={{
          x: checked ? 20 : 2,
          scale: checked ? 1.1 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
        className={`absolute top-1 left-0 w-4 h-4 rounded-full shadow-sm ${
          checked ? 'bg-white' : 'bg-neutral-400'
        }`}
      />
    </button>
  );
}

interface SettingInputProps {
  label: string;
  desc: string;
  value: string | number;
  onChange: (val: string | number) => void;
  icon?: LucideIcon;
  placeholder?: string;
  type?: string;
}

function SettingInput({
  label,
  desc,
  value,
  onChange,
  icon: Icon,
  placeholder,
  type = 'text',
}: SettingInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-zinc-400 flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </label>
      <div className="group relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#202020] border border-[#333333] rounded-md px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
        />
      </div>
      <p className="text-[10px] text-zinc-500">{desc}</p>
    </div>
  );
}

interface InputGroupProps {
  label: string;
  description: string;
  value: number;
  suffix: string;
  onChange: (val: string) => void;
}
function InputGroup({ label, description, value, suffix, onChange }: InputGroupProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-medium text-zinc-200">{label}</label>
        <span className="text-xs text-zinc-500 font-mono">{suffix}</span>
      </div>
      <input
        type="number"
        value={value}
        step="any"
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#202020] border border-[#333333] rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-zinc-500 transition-colors"
      />
      <p className="text-xs text-zinc-500">{description}</p>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
}
function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-[#202020] border border-[#333333] p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-center">
      <Icon className="w-5 h-5 text-zinc-500 mb-1" />
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
      <div className="text-xs text-zinc-400 uppercase tracking-widest">{label}</div>
    </div>
  );
}

interface TimelineRowProps {
  label: string;
  time?: string;
  icon: LucideIcon;
}
function TimelineRow({ label, time, icon: Icon }: TimelineRowProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded bg-[#2F2F2F] text-zinc-400">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-sm text-zinc-300">{label}</span>
      </div>
      <span className="text-xs font-mono text-zinc-500">{time ? time : 'Never'}</span>
    </div>
  );
}

interface SafetyToggleProps {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (c: boolean) => void;
  icon: LucideIcon;
}
function SafetyToggle({ title, desc, checked, onChange, icon: Icon }: SafetyToggleProps) {
  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        checked ? 'bg-[#202020] border-white/20' : 'bg-[#202020]/50 border-[#333333]'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-2 rounded-lg ${
            checked ? 'bg-white text-black' : 'bg-[#333333] text-zinc-500'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`text-sm font-semibold ${checked ? 'text-white' : 'text-zinc-400'}`}>
              {title}
            </h4>
            <Switch checked={checked} onChange={onChange} />
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed pr-8">{desc}</p>
        </div>
      </div>
    </div>
  );
}
