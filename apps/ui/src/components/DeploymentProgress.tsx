import { useState, useEffect } from 'react';
import {
  Loader2,
  ChevronRight,
  ChevronDown,
  Globe,
  GitBranch,
  CircleAlert,
  Clock,
  PlayCircle,
} from 'lucide-react';

interface DeploymentData {
  status: string;
  repo_name: string;
  repo_owner: string;
  user_id: string;
  login: string;
  avatar_url: string;
}

export function DeploymentProgress() {
  const [isLogsOpen, setIsLogsOpen] = useState(true);
  const [deploymentData, setDeploymentData] = useState<DeploymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeploymentData = async () => {
      const deploymentId = localStorage.getItem('currentDeploymentId');

      if (!deploymentId) {
        console.error('No deployment ID in localStorage');
        setError('No deployment ID found.');
        setLoading(false);
        return;
      }

      try {
        let token = localStorage.getItem('authToken');
        if (!token) {
          token =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3Njc2NDAzODYsImV4cCI6MTc3NjE5Mzk4Nn0.8aandcUrp7hKDP8Ryw5xlP51Z0EZYKZyec8xM43lZUU';
        }

        const response = await fetch(
          'https://untolerative-len-rumblingly.ngrok-free.dev/user/deploy-dashboard',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify({
              deploymentId: deploymentId,
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          // extracted the nested deployment object
          if (data.deployment) {
            setDeploymentData(data.deployment);
          } else {
            setDeploymentData(data); // Fallback if it is flat
          }
        } else {
          console.error('Fetch failed');
          setError('Failed to fetch deployment data.');
        }
      } catch (err) {
        console.error('Error fetching deployment data:', err);
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeploymentData();
    // Optional: Poll for updates every few seconds?
    // For now just fetch once on mount as per initial requirement, or maybe user wants live updates.
    // Given "live data" in prompt, I'll stick to single fetch first, but structure allows wrapping in interval if needed.
    const intervalId = setInterval(fetchDeploymentData, 5000); // Polling every 5s for status updates

    return () => clearInterval(intervalId);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'READY':
        return 'bg-green-500';
      case 'ERROR':
        return 'bg-red-500';
      case 'BUILDING':
        return 'bg-blue-500';
      case 'QUEUED':
        return 'bg-yellow-500';
      default:
        return 'bg-zinc-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading deployment details...</span>
      </div>
    );
  }

  if (error && !deploymentData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-500">
        <CircleAlert className="w-5 h-5 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-400 font-sans selection:bg-white/20 p-6 md:p-12 font-xs">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Top Section: Status & Metadata */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Status Card */}
          <div className="lg:col-span-2 border border-zinc-900 rounded-lg p-6 bg-zinc-950/50 flex flex-col justify-between min-h-[200px]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-900">
                  {deploymentData?.status === 'BUILDING' || deploymentData?.status === 'QUEUED' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                  ) : (
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(deploymentData?.status)}`}
                    />
                  )}
                </div>
                <span className="font-medium text-zinc-200 uppercase tracking-wide text-xs">
                  {deploymentData?.status || 'UNKNOWN'}
                </span>
              </div>

              <div className="pl-11 space-y-2">
                <h1 className="text-2xl text-white font-medium tracking-tight">
                  {deploymentData?.repo_name || 'Unknown Project'}
                </h1>
                <p className="text-sm text-zinc-500">
                  {deploymentData?.status === 'READY'
                    ? 'Deployment successful. Your app is live.'
                    : 'Making it happen. Watching the logs...'}
                </p>
              </div>
            </div>

            <div className="mt-6 pl-11">
              <a
                href={
                  deploymentData?.repo_owner && deploymentData?.repo_name
                    ? `https://github.com/${deploymentData.repo_owner}/${deploymentData.repo_name}`
                    : '#'
                }
                target="_blank"
                rel="noreferrer"
                className="text-xs border border-zinc-800 bg-zinc-900 px-4 py-1.5 rounded hover:bg-zinc-800 transition-colors text-zinc-300 inline-block"
              >
                View Repository
              </a>
            </div>
          </div>

          {/* Metadata Grid (Right Side) */}
          <div className="space-y-6 lg:pl-4">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-zinc-600 font-medium">
                  Created
                </span>
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  {deploymentData?.avatar_url ? (
                    <img src={deploymentData.avatar_url} className="w-4 h-4 rounded-full" alt="" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-zinc-800" />
                  )}
                  <span className="truncate max-w-[80px]">{deploymentData?.login || 'User'}</span>
                  <span className="text-zinc-600 text-xs">just now</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-zinc-600 font-medium">
                  Status
                </span>
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(deploymentData?.status)} ${
                      deploymentData?.status === 'BUILDING' ? 'animate-pulse' : ''
                    }`}
                  ></div>
                  <span className="capitalize">
                    {deploymentData?.status?.toLowerCase() || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-zinc-600 font-medium">
                  Duration
                </span>
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <Clock className="w-3 h-3 text-zinc-600" />
                  <span>--</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-zinc-600 font-medium">
                  Environment
                </span>
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <PlayCircle className="w-3 h-3 text-zinc-600" />
                  <span>Production</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-900 w-full my-4"></div>

            {/* Domains */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-zinc-600 font-medium">
                Domains
              </span>
              <div className="space-y-1">
                {deploymentData?.repo_name ? (
                  <a
                    href={`https://${deploymentData.repo_name}.vercel.app`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors truncate"
                  >
                    <Globe className="w-3.5 h-3.5 text-zinc-700" />
                    <span className="truncate">{deploymentData.repo_name}.vercel.app</span>
                  </a>
                ) : (
                  <div className="text-sm text-zinc-600">Pending...</div>
                )}
              </div>
            </div>

            {/* Source */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-zinc-600 font-medium">
                Source
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <GitBranch className="w-3.5 h-3.5 text-zinc-700" />
                  <span className="font-mono text-xs">main</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deployment Settings Bar - Just decorative as per screenshot */}
        <div className="border border-zinc-900 rounded-lg p-3 bg-zinc-950/30 flex items-center justify-between">
          <div className="flex items-center gap-2 px-2">
            <ChevronRight className="w-4 h-4 text-zinc-600" />
            <span className="text-sm font-medium text-zinc-300">Deployment Settings</span>
            <span className="ml-2 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-medium">
              3 Recommendations
            </span>
          </div>
        </div>

        {/* Build Logs */}
        <div className="border border-zinc-900 rounded-lg overflow-hidden bg-black">
          {/* Header */}
          <button
            onClick={() => setIsLogsOpen(!isLogsOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-zinc-950/50 hover:bg-zinc-900/50 transition-colors border-b border-zinc-900"
          >
            <div className="flex items-center gap-2">
              {isLogsOpen ? (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              )}
              <span className="text-sm font-medium text-zinc-300">Build Logs</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 font-mono">1s</span>
              <div className="w-px h-3 bg-zinc-800"></div>
              <div className="flex items-center gap-1.5">
                <CircleAlert className="w-3.5 h-3.5 text-red-500" />
              </div>
            </div>
          </button>

          {/* Logs Content */}
          {isLogsOpen && (
            <div className="p-4 font-mono text-[11px] md:text-xs">
              <div className="flex justify-between items-center mb-4 px-2">
                <span className="text-zinc-600 flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-zinc-800 rounded flex items-center justify-center pt-0.5">
                    ↴
                  </span>
                  6 lines
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Find in logs"
                      className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1 w-48 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                    />
                    <kbd className="absolute right-2 top-1.5 text-[9px] text-zinc-500 bg-zinc-800/50 px-1 rounded border border-zinc-800">
                      ⌘F
                    </kbd>
                  </div>
                </div>
              </div>

              <div className="space-y-1 px-2 pb-6">
                <div className="flex gap-4 opacity-50">
                  <span className="text-zinc-600 select-none w-20 shrink-0">01:24:12.338</span>
                  <span className="text-zinc-400">
                    Running build in Washington, D.C., USA (East) - iad1
                  </span>
                </div>
                <div className="flex gap-4 opacity-60">
                  <span className="text-zinc-600 select-none w-20 shrink-0">01:24:12.339</span>
                  <span className="text-zinc-400">Build machine configuration: 2 cores, 8 GB</span>
                </div>
                <div className="flex gap-4 opacity-70">
                  <span className="text-zinc-600 select-none w-20 shrink-0">01:24:12.563</span>
                  <span className="text-zinc-400">
                    Cloning{' '}
                    {deploymentData?.repo_owner
                      ? `github.com/${deploymentData.repo_owner}/${deploymentData.repo_name}`
                      : 'repository'}{' '}
                    (Branch: main)
                  </span>
                </div>
                <div className="flex gap-4 opacity-80">
                  <span className="text-zinc-600 select-none w-20 shrink-0">01:24:12.564</span>
                  <span className="text-zinc-400">Previous build caches not available.</span>
                </div>
                <div className="flex gap-4 opacity-90">
                  <span className="text-zinc-600 select-none w-20 shrink-0">01:24:12.933</span>
                  <span className="text-zinc-400">Cloning completed: 370.000ms</span>
                </div>
                <div className="flex gap-4 mt-2">
                  <span className="text-zinc-600 select-none w-20 shrink-0">01:24:13.032</span>
                  <span className="text-zinc-100 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse"></span>
                    Waiting for backend signal...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section Items (as per screenshot) */}
        <div className="border-t border-zinc-900 pt-2 space-y-px">
          {['Deployment Summary', 'Deployment Checks', 'Assigning Custom Domains'].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between px-4 py-3 border border-transparent hover:border-zinc-900/50 hover:bg-zinc-900/20 rounded transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                  {item}
                </span>
              </div>
              <Clock className="w-4 h-4 text-zinc-800" />
            </div>
          ))}
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
          {[
            { title: 'Runtime Logs', sub: 'View and debug runtime logs & errors' },
            { title: 'Observability', sub: 'Monitor app health & performance' },
            {
              title: 'Speed Insights',
              sub: 'Performance metrics from real users',
              badge: 'Not Enabled',
            },
            {
              title: 'Web Analytics',
              sub: 'Analyze visitors & traffic in real-time',
              badge: 'Not Enabled',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="border border-zinc-900 bg-zinc-950/30 rounded p-4 space-y-1 hover:border-zinc-800 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-200 group-hover:text-white">
                  {card.title}
                </span>
                {card.badge && (
                  <span className="text-[10px] bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-800">
                    {card.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 group-hover:text-zinc-400 line-clamp-2">
                {card.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
