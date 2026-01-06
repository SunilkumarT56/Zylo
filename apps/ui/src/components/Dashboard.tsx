import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, ArrowUpRight } from 'lucide-react';
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
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3Njc2NDAzODYsImV4cCI6MTc3NjE5Mzk4Nn0.8aandcUrp7hKDP8Ryw5xlP51Z0EZYKZyec8xM43lZUU';
        }

        const response = await fetch(
          'https://untolerative-len-rumblingly.ngrok-free.dev/user/dashboard',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true',
            },
            // ...
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

  const projects = deploymentData
    .filter((item) => item && item.projectname && item.projectname.trim() !== '')
    .map((item) => ({
      id: item.deployment_id,
      name: item.projectname || '',
      domain: `${item.projectname || ''}.zylo.dev`,
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
    <div className="min-h-screen bg-[#191919] text-[#D4D4D4] font-sans">
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
            <h1 className="text-3xl font-bold tracking-tight text-[#FFFFFF] mb-1">Overview</h1>
            <p className="text-sm text-[#9B9A97]">Manage your projects and deployments.</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9B9A97] group-focus-within:text-[#D4D4D4] transition-colors" />
              <Input
                placeholder="Filter projects..."
                className="pl-10 bg-[#2F2F2F] border-[#3F3F3F] text-[#D4D4D4] placeholder:text-[#9B9A97] h-10 w-full focus:bg-[#3F3F3F] focus:border-[#4F4F4F] rounded-lg transition-all font-medium text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-8">
            {/* User Profile Card */}
            {deploymentData[0] && (
              <div className="rounded-xl border border-[#2F2F2F] bg-[#191919] p-5 flex items-center gap-4">
                <img
                  src={deploymentData[0].avatar_url}
                  alt={deploymentData[0].github_name}
                  className="h-12 w-12 rounded-full border border-[#2F2F2F] object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#D4D4D4] truncate">
                    {deploymentData[0].github_name}
                  </h3>
                  <p className="text-xs text-[#9B9A97] truncate">{deploymentData[0].email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#2F2F2F] text-[#9B9A97] border border-[#3F3F3F]">
                      Pro Plan
                    </span>
                  </div>
                </div>
              </div>
            )}

            <UsageStats />

            {/* Upgrade Card */}
            <div className="group relative overflow-hidden rounded-xl border border-[#2F2F2F] bg-[#191919] p-6 hover:bg-[#2F2F2F]/50 transition-colors">
              <h3 className="relative text-sm font-semibold text-[#D4D4D4] mb-2">Pro Plan</h3>
              <p className="relative text-xs text-[#9B9A97] mb-4 leading-relaxed">
                Unlock higher limits and advanced analytics for your growing projects.
              </p>
              <Button
                variant="link"
                className="relative p-0 h-auto text-xs text-[#D4D4D4] hover:text-white font-medium flex items-center gap-1"
              >
                Upgrade Now <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-medium text-[#9B9A97]">Active Deployments</h2>
              <span className="text-xs text-[#9B9A97]">{filteredProjects.length} Projects</span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="h-8 w-8 text-[#2F2F2F] animate-spin" />
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} {...project} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 border border-dashed border-[#2F2F2F] rounded-2xl bg-[#191919]">
                <p className="text-[#9B9A97] text-sm mb-2">No projects found</p>
                <Button
                  variant="link"
                  className="text-[#D4D4D4]"
                  onClick={() => setSearchQuery('')}
                >
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
