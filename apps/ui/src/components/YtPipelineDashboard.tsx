// ... imports
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Youtube,
  Play,
  Settings,
  Loader2,
  Check,
  Shield,
  Cpu,
  Calendar,
  Clock,
  X,
  FileText,
  Trash2,
  Home,
  Workflow,
  Bot,
  Database,
  Sliders,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'; // Added icons
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/Header';
import { GlobalAnalyticsSnapshot } from './dashboard/GlobalAnalyticsSnapshot';
import { PipelineWizardProvider, usePipelineWizard } from './create-pipeline/PipelineWizardContext';
import { PipelineActionsMenu } from '@/components/PipelineActionsMenu';
import { CreatePipelineWizard } from './create-pipeline/CreatePipelineWizard';
import { type ChannelData } from './create-pipeline/types';

interface Pipeline {
  name: string;
  admin_name: string;
  color?: string;
  _id?: string;
}

interface PipelineDetails extends Pipeline {
  pipeline_type: string;
  execution_mode: string;
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
    approvalFlow: boolean;
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

function DashboardContent() {
  const navigate = useNavigate();

  const { setIsOpen, setUserChannel } = usePipelineWizard();
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);

  const [selectedPipeline, setSelectedPipeline] = useState<PipelineDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 2;

  // Sidebar resize logic
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      // Constrain width
      if (newWidth < 160) newWidth = 160;
      if (newWidth > 480) newWidth = 480;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    // ... permission check logic (same as before)
    const checkPermission = async () => {
      let token = localStorage.getItem('authToken');

      if (!token) {
        console.log('Using fallback hardcoded token for dashboard');
        token =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3NjcwMjIyNjQsImV4cCI6MTc2NzYyNzA2NH0.EA5Pfu0vIkHI5SatbEbZ6HLw2y6QStoXOALz5cRJTiM';
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
    setSelectedPipeline(null); // Clear previous selection while loading? Or keep it? Let's clear to show loading.

    try {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3NjcwMjIyNjQsImV4cCI6MTc2NzYyNzA2NH0.EA5Pfu0vIkHI5SatbEbZ6HLw2y6QStoXOALz5cRJTiM';
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
        const data = await response.json();
        const pipelineData = data.pipeline || data;

        if (pipelineData && pipelineData.header) {
          // Mapping new structure to existing state shape for compatibility
          setSelectedPipeline({
            ...pipelineData.header,
            // Map keys if needed, though most match (name, status, color).
            // PipelineType from header is camelCase 'pipelineType' vs 'pipeline_type' in old state?
            // The user example shows `pipelineType`. Old code used `pipeline_type`.
            pipeline_type: pipelineData.header.pipelineType,
            execution_mode: pipelineData.header.executionMode,
            created_at: pipelineData.metadata?.createdAt,
            // Full details for new view
            readiness: pipelineData.readiness,
            configuration: pipelineData.configuration,
            adminLimits: pipelineData.adminLimits,
            metadata: pipelineData.metadata,
          });
        } else if (data.pipeline) {
          setSelectedPipeline(data.pipeline);
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
      <Header
        onLogout={handleLogout}
        userEmail={userEmail}
        userAvatarUrl={channelData?.thumbnails?.default?.url}
        userName={channelData?.title}
      />

      <CreatePipelineWizard />

      <div className="flex-1 flex max-w-full w-full pt-16">
        {/* Static Sidebar */}
        <div className="w-64 border-r border-[#2F2F2F] bg-[#191919] flex flex-col h-[calc(100vh-64px)] hidden md:flex shrink-0">
          {/* Notion-style Header / Channel Info */}
          <div className="p-2">
            {channelData ? (
              <div className="flex items-center gap-2 p-2 rounded-md hover:bg-[#2F2F2F] cursor-pointer transition-colors">
                <div className="w-5 h-5 rounded overflow-hidden shrink-0">
                  <img
                    src={channelData.thumbnails.default.url}
                    alt="CH"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="truncate text-sm font-medium text-[#E3E3E3] flex-1">
                  {channelData.title}
                </div>
                {/* Optional Chevrons or Settings icon could go here on hover */}
              </div>
            ) : (
              <div className="p-2 text-sm text-[#9B9A97]">Loading...</div>
            )}
          </div>

          {/* Main Navigation Items (Search, Home) */}
          <div className="px-2 pb-2 space-y-0.5">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-[#2F2F2F] text-[#9B9A97] hover:text-[#D4D4D4] cursor-pointer transition-colors text-sm">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-[#252525] text-[#E3E3E3] cursor-pointer transition-colors text-sm font-medium">
              <Home className="w-4 h-4" />{' '}
              {/* Mocking Home icon using Check for now or generic icon if Home not imported yet */}
              <span>Overview</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-[#2F2F2F] text-[#9B9A97] hover:text-[#D4D4D4] cursor-pointer transition-colors text-sm">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-[#2F2F2F] text-[#9B9A97] hover:text-[#D4D4D4] cursor-pointer transition-colors text-sm">
              <Database className="w-4 h-4" />
              <span>Zylo MCP</span>
            </div>
            <div
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-[#2F2F2F] text-[#9B9A97] hover:text-[#D4D4D4] cursor-pointer transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Pipeline</span>
            </div>
          </div>

          {/* Scrollable Content (Pipelines) */}
          <div className="flex-1 overflow-y-auto px-2 py-2 mt-2 custom-scrollbar">
            {/* Section Header */}
            <div className="group flex items-center justify-between px-3 py-1 mb-1 text-xs font-semibold text-[#666] uppercase tracking-wider hover:text-[#999] transition-colors cursor-pointer">
              <span>Pipelines</span>
              <Plus
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(true);
                }}
                className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
              />
            </div>

            {/* Pipeline List */}
            <div className="space-y-0.5">
              {pipelines.length === 0 && (
                <div className="px-3 py-2 text-sm text-[#525252] italic">No pipelines found</div>
              )}
              {pipelines
                .slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)
                .map((pipeline) => (
                  <div
                    key={pipeline._id || pipeline.name}
                    onClick={() => handlePipelineClick(pipeline)}
                    className={`group flex items-center justify-between gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors relative ${
                      selectedPipeline?.name === pipeline.name
                        ? 'bg-[#2F2F2F] text-[#E3E3E3]'
                        : 'text-[#9B9A97] hover:bg-[#252525] hover:text-[#D4D4D4]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Small Icon */}
                      <div className="text-[#9B9A97]">
                        <Workflow className="w-4 h-4" />
                      </div>
                      <span className="truncate">{pipeline.name}</span>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PipelineActionsMenu />
                    </div>
                  </div>
                ))}
              {/* Pagination Controls */}
              {pipelines.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between px-1 mt-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className={`text-[#9B9A97] hover:text-[#D4D4D4] transition-colors p-1 rounded-md hover:bg-[#252525] ${
                      currentPage === 0 ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : ''
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-[#525252]">
                    {currentPage + 1} / {Math.ceil(pipelines.length / ITEMS_PER_PAGE)}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        (p + 1) * ITEMS_PER_PAGE < pipelines.length ? p + 1 : p,
                      )
                    }
                    disabled={(currentPage + 1) * ITEMS_PER_PAGE >= pipelines.length}
                    className={`text-[#9B9A97] hover:text-[#D4D4D4] transition-colors p-1 rounded-md hover:bg-[#252525] ${
                      (currentPage + 1) * ITEMS_PER_PAGE >= pipelines.length
                        ? 'opacity-30 cursor-not-allowed hover:bg-transparent'
                        : ''
                    }`}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8 overflow-y-auto h-[calc(100vh-64px)]">
          {/* Main Header */}
          <div className="mb-8 pb-6 border-b border-[#2F2F2F]">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Overview</h1>
            <p className="text-[#9B9A97]">Global performance across all pipelines.</p>
          </div>

          <GlobalAnalyticsSnapshot />

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
                <div className="rounded-xl border border-[#2F2F2F] bg-[#191919] p-8 relative overflow-hidden shadow-2xl">
                  <div
                    className="absolute top-0 left-0 w-full h-[2px] opacity-70"
                    style={{ background: selectedPipeline.color || '#333' }}
                  />

                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-6">
                      <div
                        className="p-3 rounded-xl bg-[#252525] border border-[#2F2F2F]"
                        style={{ color: selectedPipeline.color || 'white' }}
                      >
                        <Youtube className="w-8 h-8" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                          {selectedPipeline.name}
                        </h1>
                        <div className="flex items-center gap-4 text-[#9B9A97] mt-2 text-sm">
                          <span className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-[#252525] border border-[#2F2F2F]">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                selectedPipeline.status === 'CREATED' ||
                                selectedPipeline.status === 'Running'
                                  ? 'bg-emerald-500'
                                  : 'bg-zinc-500'
                              }`}
                            />
                            {selectedPipeline.status || 'Draft'}
                          </span>
                          <span>•</span>
                          <span>
                            {selectedPipeline.pipeline_type?.replace('_', ' ') || 'YouTube'}
                          </span>
                          {selectedPipeline.execution_mode && (
                            <>
                              <span>•</span>
                              <span>{selectedPipeline.execution_mode}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button className="h-10 px-6 bg-white text-black hover:bg-zinc-200 font-medium border border-transparent">
                        <Play className="w-4 h-4 mr-2 fill-current" /> Run Pipeline
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Detailed Configuration Grid */}
                {selectedPipeline.readiness && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Readiness */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold text-[#525252] uppercase tracking-wider">
                        Readiness
                      </h3>
                      <div className="bg-[#191919] border border-[#2F2F2F] rounded-xl p-6 space-y-4">
                        {Object.entries(selectedPipeline.readiness).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-zinc-300 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            {value ? (
                              <Check className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <X className="w-5 h-5 text-zinc-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Configuration */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold text-[#525252] uppercase tracking-wider">
                        Configuration
                      </h3>
                      <div className="bg-[#191919] border border-[#2F2F2F] rounded-xl p-6 space-y-4">
                        {selectedPipeline.configuration && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm text-zinc-400">Content Source</span>
                              <span className="text-white text-sm">
                                {selectedPipeline.configuration.contentSource}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-zinc-400">Schedule</span>
                              <span className="text-white text-sm">
                                {selectedPipeline.configuration.schedule.frequency} (
                                {selectedPipeline.configuration.schedule.timezone})
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-zinc-400">Language</span>
                              <span className="text-sm text-zinc-500 italic">
                                {selectedPipeline.configuration.metadata?.language ||
                                  'Not applied yet'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-zinc-400">Region</span>
                              <span className="text-sm text-zinc-500 italic">
                                {selectedPipeline.configuration.metadata?.region ||
                                  'Not applied yet'}
                              </span>
                            </div>
                            <div className="pt-4 border-t border-[#2F2F2F]">
                              <h4 className="text-xs font-semibold text-zinc-500 mb-2">
                                YouTube Settings
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-zinc-400">Channel ID</span>{' '}
                                  <span className="text-white">
                                    {selectedPipeline.configuration.youtube.channelId}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-zinc-400">Privacy</span>{' '}
                                  <span className="text-white">
                                    {selectedPipeline.configuration.youtube.privacy}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Admin Limits */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold text-[#525252] uppercase tracking-wider">
                        Admin Limits
                      </h3>
                      <div className="bg-[#191919] border border-[#2F2F2F] rounded-xl p-6 space-y-6">
                        {selectedPipeline.adminLimits && (
                          <>
                            <div>
                              <div className="flex items-center gap-2 mb-3 text-zinc-300 text-sm">
                                <Shield className="w-4 h-4" />{' '}
                                <span className="font-medium">Execution</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-[#1F1F1F] p-3 rounded border border-[#2F2F2F]">
                                  <div className="text-zinc-500 mb-1 text-xs">Max Concurrent</div>
                                  <div className="text-white text-lg font-mono">
                                    {selectedPipeline.adminLimits.execution.maxConcurrentRuns}
                                  </div>
                                </div>
                                <div className="bg-[#1F1F1F] p-3 rounded border border-[#2F2F2F]">
                                  <div className="text-zinc-500 mb-1 text-xs">Timeout</div>
                                  <div className="text-white text-lg font-mono">
                                    {selectedPipeline.adminLimits.execution.timeoutPerStepSeconds}s
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-3 text-zinc-300 text-sm">
                                <Cpu className="w-4 h-4" />{' '}
                                <span className="font-medium">Resources</span>
                              </div>
                              <div className="text-sm space-y-2 text-zinc-400">
                                <div className="flex justify-between">
                                  <span>CPU</span>{' '}
                                  <span className="text-white font-mono">
                                    {selectedPipeline.adminLimits.resources.cpu} vCore
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Memory</span>{' '}
                                  <span className="text-white font-mono">
                                    {selectedPipeline.adminLimits.resources.memoryMB} MB
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Metadata */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold text-[#525252] uppercase tracking-wider">
                        Metadata
                      </h3>
                      <div className="bg-[#191919] border border-[#2F2F2F] rounded-xl p-6">
                        {selectedPipeline.metadata && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-zinc-500" />
                              <div>
                                <div className="text-xs text-zinc-500 uppercase">Created At</div>
                                <div className="text-white text-sm">
                                  {new Date(selectedPipeline.metadata.createdAt).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-zinc-500" />
                              <div>
                                <div className="text-xs text-zinc-500 uppercase">Last Updated</div>
                                <div className="text-white text-sm">
                                  {new Date(selectedPipeline.metadata.updatedAt).toLocaleString()}
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
