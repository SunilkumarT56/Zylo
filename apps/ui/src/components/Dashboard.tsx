import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Loader2, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Header } from '@/components/Header';
import { UsageStats } from './UsageStats';
import { ProjectCard } from './ProjectCard';

export function Dashboard() {
  interface DashboardData {
    user_id: string;
    email: string;
    avatar_url: string;
    github_name: string;
    project_id: string;
    projectname: string;
    repo_name: string;
    repo_owner: string;
    deployment_id: string;
    status: string;
    deployment_created_at: string;
  }

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [deploymentData, setDeploymentData] = useState<DashboardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        let token = localStorage.getItem('authToken');
        if (!token) {
          token =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZTgwZjM5Mi1hN2NlLTQwYjUtOTc3Zi0xNjM5YjU3MjZkYTMiLCJpYXQiOjE3NjY1MDA2MzIsImV4cCI6MTc2NzEwNTQzMn0.NniSk_TnqLk3uRoyp9WrNkf4h_GQJe0Z3zKvEQX48Lg';
        }

        const response = await fetch(
          'https://untolerative-len-rumblingly.ngrok-free.dev/user/dashboard',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true',
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (data.status && Array.isArray(data.dashboardData)) {
            setDeploymentData(data.dashboardData);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    return Math.floor(seconds) + 's ago';
  };

  const projects = deploymentData.map((item) => ({
    id: item.deployment_id,
    name: item.projectname,
    domain: `${item.projectname}.zylo.dev`,
    repo: `${item.repo_owner}/${item.repo_name}`,
    lastCommitMessage: `Deployment ${item.status}`,
    timeAgo: timeAgo(item.deployment_created_at),
    branch: 'main',
  }));

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-white/5 blur-[100px] rounded-full mix-blend-screen opacity-50" />
      </div>

      <Header
        onLogout={() => {
          localStorage.removeItem('authToken');
          navigate('/login');
        }}
        userName={deploymentData[0]?.github_name}
        userEmail={deploymentData[0]?.email}
        userAvatarUrl={deploymentData[0]?.avatar_url}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 pt-32 pb-24">
        {/* Overview & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Overview</h1>
            <p className="text-sm text-zinc-500">Manage your projects and deployments.</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-white transition-colors" />
              <Input
                placeholder="Filter projects..."
                className="pl-10 bg-white/5 border-white/5 text-white placeholder:text-zinc-600 h-10 w-full focus:bg-white/10 focus:border-white/10 rounded-lg transition-all font-medium text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              className="bg-white text-black hover:bg-zinc-200 h-10 px-5 font-bold text-sm tracking-tight rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all flex items-center gap-2"
              onClick={() => navigate('/new')}
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-8">
            {/* User Profile Card */}
            {deploymentData[0] && (
              <div className="rounded-xl border border-white/10 bg-zinc-950/50 p-5 flex items-center gap-4 backdrop-blur-sm">
                <img
                  src={deploymentData[0].avatar_url}
                  alt={deploymentData[0].github_name}
                  className="h-12 w-12 rounded-full border border-white/10 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    {deploymentData[0].github_name}
                  </h3>
                  <p className="text-xs text-zinc-500 truncate">{deploymentData[0].email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/10 text-zinc-300 border border-white/5">
                      Pro Plan
                    </span>
                  </div>
                </div>
              </div>
            )}

            <UsageStats />

            {/* Upgrade Card */}
            <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-950/50 p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="relative text-sm font-semibold text-white mb-2">Pro Plan</h3>
              <p className="relative text-xs text-zinc-500 mb-4 leading-relaxed">
                Unlock higher limits and advanced analytics for your growing projects.
              </p>
              <Button
                variant="link"
                className="relative p-0 h-auto text-xs text-white hover:text-zinc-300 font-medium flex items-center gap-1"
              >
                Upgrade Now <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-medium text-zinc-400">Active Deployments</h2>
              <span className="text-xs text-zinc-600">{filteredProjects.length} Projects</span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="h-8 w-8 text-white/20 animate-spin" />
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} {...project} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                <p className="text-zinc-500 text-sm mb-2">No projects found</p>
                <Button variant="link" className="text-zinc-300" onClick={() => setSearchQuery('')}>
                  Clear filter
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
