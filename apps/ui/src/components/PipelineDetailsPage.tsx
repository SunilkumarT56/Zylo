import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Youtube, Calendar, Shield, Cpu, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PipelineHeader {
  id: string;
  name: string;
  status: string;
  pipelineType: string;
  executionMode: string;
  color: string;
}

interface PipelineResponse {
  header: PipelineHeader;
  readiness: {
    sourceConfigured: boolean;
    youtubeConnected: boolean;
    scheduleConfigured: boolean;
    adminLimitsApplied: boolean;
    verified: boolean;
  };
  configuration: {
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
  adminLimits: {
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
  metadata: {
    createdAt: string;
    updatedAt: string;
    ownerUserId: string;
  };
}

export function PipelineDetailsPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState<PipelineResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic auth check
    const token = localStorage.getItem('authToken');
    const isAuthenticated = localStorage.getItem('isAuthenticated');

    if (!token || !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (name) {
      fetchPipelineDetails(name);
    }
  }, [name, navigate]);

  const fetchPipelineDetails = async (pipelineName: string) => {
    setLoading(true);
    try {
      let token = localStorage.getItem('authToken');
      if (!token) {
        token =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3Njc2NDAzODYsImV4cCI6MTc3NjE5Mzk4Nn0.8aandcUrp7hKDP8Ryw5xlP51Z0EZYKZyec8xM43lZUU';
      }

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
        const data = await response.json();
        console.log('API Response:', data); // Debug log

        // User confirmed structure: { status: true, pipeline: ... }
        if (data.pipeline) {
          console.log('Setting pipeline from data.pipeline', data.pipeline);
          setPipeline(data.pipeline);
        } else if (data.header) {
          console.log('Setting pipeline from data directly', data);
          setPipeline(data);
        } else {
          console.error('Unknown response structure', data);
        }
      } else {
        console.error('Failed to fetch details', response.status);
      }
    } catch (error) {
      console.error('Error fetching details', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!pipeline) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Pipeline not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Reuse Header if possible, or simple back navigation */}
      <div className="border-b border-[#2F2F2F] bg-[#191919]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-white"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">{pipeline.header.name} / details</h1>
          </div>
          <div>{/* Optional Actions */}</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Header Summary Card */}
        <div className="rounded-xl border border-[#2F2F2F] bg-[#191919] p-8 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full h-1 opacity-50"
            style={{ background: pipeline.header.color || '#333' }}
          />
          <div className="flex items-center gap-6">
            <div
              className="p-3 rounded-xl bg-[#2F2F2F]"
              style={{ color: pipeline.header.color || 'white' }}
            >
              <Youtube className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{pipeline.header.name}</h1>
              <div className="flex items-center gap-4 text-[#9B9A97] mt-2">
                <span className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      pipeline.header.status === 'CREATED' ? 'bg-green-500' : 'bg-zinc-500'
                    }`}
                  />
                  {pipeline.header.status}
                </span>
                <span>•</span>
                <span>{pipeline.header.pipelineType}</span>
                <span>•</span>
                <span>{pipeline.header.executionMode}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Readiness */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#525252] uppercase tracking-wider">
              Readiness
            </h3>
            <div className="bg-[#191919] border border-[#2F2F2F] rounded-xl p-6 space-y-4">
              {Object.entries(pipeline.readiness).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  {value ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-zinc-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#525252] uppercase tracking-wider">
              Configuration
            </h3>
            <div className="bg-[#191919] border border-[#2F2F2F] rounded-xl p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Content Source</span>
                <span className="text-white">{pipeline.configuration.contentSource}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Schedule</span>
                <span className="text-white">
                  {pipeline.configuration.schedule.frequency} (
                  {pipeline.configuration.schedule.timezone})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Thumbnail Mode</span>
                <span className="text-white">{pipeline.configuration.thumbnail.mode}</span>
              </div>
              <div className="pt-4 border-t border-[#2F2F2F]">
                <h4 className="text-xs font-semibold text-zinc-500 mb-2">YouTube Settings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Channel ID</span>{' '}
                    <span className="text-white">{pipeline.configuration.youtube.channelId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Category</span>{' '}
                    <span className="text-white">{pipeline.configuration.youtube.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Privacy</span>{' '}
                    <span className="text-white">{pipeline.configuration.youtube.privacy}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Limits */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#525252] uppercase tracking-wider">
              Admin Limits
            </h3>
            <div className="bg-[#191919] border border-[#2F2F2F] rounded-xl p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3 text-zinc-300">
                  <Shield className="w-4 h-4" /> <span className="font-medium">Execution</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-[#1F1F1F] p-3 rounded">
                    <div className="text-zinc-500 mb-1">Max Concurrent</div>
                    <div className="text-white text-lg">
                      {pipeline.adminLimits.execution.maxConcurrentRuns}
                    </div>
                  </div>
                  <div className="bg-[#1F1F1F] p-3 rounded">
                    <div className="text-zinc-500 mb-1">Timeout</div>
                    <div className="text-white text-lg">
                      {pipeline.adminLimits.execution.timeoutPerStepSeconds}s
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3 text-zinc-300">
                  <Cpu className="w-4 h-4" /> <span className="font-medium">Resources</span>
                </div>
                <div className="text-sm space-y-2 text-zinc-400">
                  <div className="flex justify-between">
                    <span>CPU</span> <span>{pipeline.adminLimits.resources.cpu} vCore</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory</span> <span>{pipeline.adminLimits.resources.memoryMB} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage</span> <span>{pipeline.adminLimits.resources.storageMB} MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#525252] uppercase tracking-wider">
              Metadata
            </h3>
            <div className="bg-[#191919] border border-[#2F2F2F] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-zinc-500" />
                <div>
                  <div className="text-xs text-zinc-500 uppercase">Created At</div>
                  <div className="text-white">
                    {new Date(pipeline.metadata.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-zinc-500" />
                <div>
                  <div className="text-xs text-zinc-500 uppercase">Last Updated</div>
                  <div className="text-white">
                    {new Date(pipeline.metadata.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
