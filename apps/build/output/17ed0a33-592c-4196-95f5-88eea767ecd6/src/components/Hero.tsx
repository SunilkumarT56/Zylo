import { useState, useEffect } from "react";
import { Search, Github, ChevronRight, ChevronLeft, Loader2, ExternalLink, Import, Command, Terminal, Folder, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImportConfiguration, type ProjectConfig } from "./ImportConfiguration";
import { useNavigate } from "react-router-dom";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  language: string | null;
  updated_at: string;
  owner?: {
    login: string;
    avatar_url: string;
  };
  loader?: boolean; // internal to track loading state per item
}

interface Directory {
    name: string;
    path: string;
    children?: Directory[];
    type?: 'file' | 'dir';
}

const FileTreeItem = ({ node, level = 0 }: { node: Directory; level?: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div
            className="select-none"
            onMouseEnter={() => hasChildren && setIsOpen(true)}
            onMouseLeave={() => hasChildren && setIsOpen(false)}
        >
            <div
                className={`flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-zinc-900/50 cursor-pointer text-sm transition-colors text-zinc-400 hover:text-white group`}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={() => hasChildren && setIsOpen(!isOpen)}
            >
                {hasChildren ? (
                    <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </span>
                ) : (
                    <span className="w-4" />
                )}

                {hasChildren ? (
                    <Folder className={`h-4 w-4 ${isOpen ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                ) : (
                    <Folder className="h-4 w-4 text-zinc-600" />
                )}

                <span className="font-mono text-xs">{node.name}</span>
            </div>
            {isOpen && hasChildren && (
                <div className="animate-in slide-in-from-top-1 fade-in duration-200">
                    {node.children!.map((child, i) => (
                        <FileTreeItem key={`${child.path}-${i}`} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

interface PreviewData {
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  stars: number;
  forks: number;
  open_issues: number;
  updated_at: string;
  html_url: string;
  language: string;
  languages: Record<string, number>;
  commits?: Commit[];
  directories?: Directory[];
  owner?: {
      login: string;
      avatar_url: string;
  };
}

interface Commit {
  message: string;
  author: string;
  time: string;
}

export function Hero() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [importingRepoId, setImportingRepoId] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLogin, setUserLogin] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [, setCommitPage] = useState(1);
  const [manualRepoUrl, setManualRepoUrl] = useState("");
  const [manualImportLoading, setManualImportLoading] = useState(false);

  // Configuration State
  const [showConfig, setShowConfig] = useState(false);
  const [deploying, setDeploying] = useState(false);



  useEffect(() => {
    const fetchRepos = async () => {
      setLoading(true);
      setError(null);
      try {
        let token = localStorage.getItem("authToken");

        if (!token) {
            token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZTgwZjM5Mi1hN2NlLTQwYjUtOTc3Zi0xNjM5YjU3MjZkYTMiLCJpYXQiOjE3NjY1MDA2MzIsImV4cCI6MTc2NzEwNTQzMn0.NniSk_TnqLk3uRoyp9WrNkf4h_GQJe0Z3zKvEQX48Lg";
        }

        const headers: HeadersInit = {
             "Content-Type": "application/json",
             "ngrok-skip-browser-warning": "true",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`https://untolerative-len-rumblingly.ngrok-free.dev/user/new?page=${currentPage}&search=${searchQuery}`, {
            headers
        });

        if (!response.ok) {
            throw new Error("Failed to fetch repositories");
        }

        const data = await response.json();

        setRepos(data.repos || []);
        setHasNextPage(data.hasNextPage);
        setUserLogin(data.login);
        setUserAvatar(data.avatar_url);

      } catch (err) {
        console.error("Error fetching repos:", err);
        setError("Failed to load repositories.");
        setRepos([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
        fetchRepos();
    }, 300);

    return () => clearTimeout(timeoutId);

  }, [currentPage, searchQuery]);

  const handleNext = () => {
    if (hasNextPage) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleRepoClick = async (repo: Repository, isImportAction: boolean = false) => {
      setImportingRepoId(repo.id);
      try {
        let token = localStorage.getItem("authToken");
        if (!token) {
             token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZTgwZjM5Mi1hN2NlLTQwYjUtOTc3Zi0xNjM5YjU3MjZkYTMiLCJpYXQiOjE3NjY1MDA2MzIsImV4cCI6MTc2NzEwNTQzMn0.NniSk_TnqLk3uRoyp9WrNkf4h_GQJe0Z3zKvEQX48Lg";
        }

        const owner = userLogin || repo.owner?.login;
        if (!owner) {
            return;
        }

        const endpoint = isImportAction
            ? "https://untolerative-len-rumblingly.ngrok-free.dev/user/new/import"
            : "https://untolerative-len-rumblingly.ngrok-free.dev/user/preview";

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({
                owner: owner,
                repoName: repo.name
            })
        });

        if (response.ok) {
            const data = await response.json();

            let robustData: PreviewData;

            if (isImportAction && data.directories && Array.isArray(data.directories)) {
                 robustData = {
                    name: repo.name,
                    full_name: repo.full_name,
                    private: repo.private,
                    default_branch: "main",
                    stars: 0,
                    forks: 0,
                    open_issues: 0,
                    updated_at: repo.updated_at,
                    html_url: repo.html_url,
                    language: repo.language || "Unknown",
                    languages: {},
                    commits: [],
                    directories: data.directories,
                    owner: {
                        login: owner,
                        avatar_url: userAvatar || ""
                    }
                 };
            } else {
                 robustData = {
                    name: data.name || repo.name,
                    full_name: data.full_name || repo.full_name,
                    private: data.private ?? repo.private,
                    default_branch: data.default_branch || "main",
                    stars: data.stars || 0,
                    forks: data.forks || 0,
                    open_issues: data.open_issues || 0,
                    updated_at: data.updated_at || repo.updated_at,
                    html_url: data.html_url || repo.html_url,
                    language: data.language || repo.language || "Unknown",
                    languages: data.languages || {},
                    commits: data.commits || [],
                    directories: data.directories || [],
                    owner: {
                        login: data.owner?.login || owner,
                        avatar_url: data.owner?.avatar_url || userAvatar || ""
                    }
                };
            }

            setPreviewData(robustData);
            setCommitPage(1);

            if (isImportAction) {
                setShowConfig(true);
            } else {
                setShowConfig(false);
            }
        }
      } catch (error) {
          console.error("Error handling repo click:", error);
      } finally {
          setImportingRepoId(null);
      }
  };

  const handleManualImport = async () => {
      if (!manualRepoUrl.trim()) return;

      setManualImportLoading(true);
      try {
        let token = localStorage.getItem("authToken");
        if (!token) {
             token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZTgwZjM5Mi1hN2NlLTQwYjUtOTc3Zi0xNjM5YjU3MjZkYTMiLCJpYXQiOjE3NjY1MDA2MzIsImV4cCI6MTc2NzEwNTQzMn0.NniSk_TnqLk3uRoyp9WrNkf4h_GQJe0Z3zKvEQX48Lg";
        }

        const response = await fetch("https://untolerative-len-rumblingly.ngrok-free.dev/user/github-url", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({
                githubUrl: manualRepoUrl
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (!data.owner && userLogin) {
                 data.owner = { login: userLogin, avatar_url: userAvatar || "" };
            }
            setPreviewData(data);
            setCommitPage(1);
            setError(null);
            setShowConfig(true);
        }
      } catch (error) {
          console.error("Error importing repo via URL:", error);
      } finally {
          setManualImportLoading(false);
      }
  };

  const handleFinalDeploy = async (config: ProjectConfig) => {
      if (!previewData) return;

      setDeploying(true);
      try {
        let token = localStorage.getItem("authToken");
        if (!token) {
             token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZTgwZjM5Mi1hN2NlLTQwYjUtOTc3Zi0xNjM5YjU3MjZkYTMiLCJpYXQiOjE3NjY1MDA2MzIsImV4cCI6MTc2NzEwNTQzMn0.NniSk_TnqLk3uRoyp9WrNkf4h_GQJe0Z3zKvEQX48Lg";
        }

        const envsObject = config.envVars
            .filter(e => e.key && e.value)
            .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

        const payload = {
            deploy: {
                owner: previewData.owner?.login || userLogin || "",
                repoName: previewData.name,
                rootDirectory: config.rootDirectory,
                framework: config.framework,
                buildCommand: config.buildCommand || "",
                outputDir: config.outputDirectory || "",
                installCommand: config.installCommand || "",
                envs: envsObject,
                projectName: config.projectName
            }
        };

        const response = await fetch("https://untolerative-len-rumblingly.ngrok-free.dev/user/new/deploy", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();

            // Check if deploymentId exists in the response
            const deploymentId = data.deploymentId;

            if (deploymentId) {
                // Store deploymentId locally
                localStorage.setItem("currentDeploymentId", deploymentId);

                // Send post request to dashboard
                try {
                     await fetch("https://untolerative-len-rumblingly.ngrok-free.dev/user/deploy-dashboard", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                           "ngrok-skip-browser-warning": "true",
                        },
                        body: JSON.stringify({
                            deploymentId: deploymentId
                        })
                    });
                } catch (dashboardError) {
                    console.error("Failed to report deployment dashboard:", dashboardError);
                    // We continue even if this fails, as the deployment itself succeeded
                }
            }

            if (data.status === true) {
                 navigate("/deploying");
            } else {
                 setShowConfig(false);
                 setImportingRepoId(null);
            }
        } else {
            setError("Deployment failed. Please try again.");
        }
      } catch (error) {
          setError("An error occurred during deployment.");
      } finally {
          setDeploying(false);
      }
  };

  if (showConfig && previewData) {
      return (
          <div className="min-h-screen bg-black text-white pt-24 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300 relative">

              <ImportConfiguration
                  repo={previewData}
                  onBack={() => setShowConfig(false)}
                  onDeploy={handleFinalDeploy}
                  loading={deploying}
              />
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-start gap-12 relative">
       {/* Background - Simplified to just black (no grid/gradient) as per request */}
       <div className="fixed inset-0 z-0 bg-black pointer-events-none"></div>

        <div className="w-full relative z-10 space-y-2">
          {/* Removed motion */}
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            New Project
          </h1>
          <p className="text-zinc-500 text-lg">
            Import a repository to start deploying within seconds.
          </p>
        </div>

      <div className="w-full flex flex-col lg:flex-row gap-8 relative z-10 pb-20">
        {/* Left Column: Search & Repos */}
        <div className="w-full lg:w-3/5 flex flex-col gap-6">

            {/* Import Card */}
            <div className="rounded-xl border border-zinc-800 bg-black overflow-hidden">
                <div className="p-6 space-y-6">
                    {/* Manual Import */}
                    <div className="flex gap-3">
                        <div className="relative flex-1 group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                <Github className="h-4 w-4" />
                            </div>
                            <Input
                                placeholder="Enter GitHub URL to deploy..."
                                className="bg-transparent border-zinc-800 text-white placeholder:text-zinc-600 h-10 pl-10 rounded-md focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/20 transition-all w-full"
                                value={manualRepoUrl}
                                onChange={(e) => setManualRepoUrl(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={handleManualImport}
                            disabled={manualImportLoading || !manualRepoUrl.trim()}
                            className="bg-white text-black hover:bg-zinc-200 h-10 px-6 font-medium rounded-md transition-colors shrink-0"
                        >
                            {manualImportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Import"}
                        </Button>
                    </div>

                    <div className="h-px w-full bg-zinc-800" />

                    <div className="flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white tracking-tight">Your Repositories</h2>

                            {/* Account Badge */}
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 cursor-default">
                                {userAvatar ? (
                                    <img src={userAvatar} alt="Profile" className="h-5 w-5 rounded-full object-cover" />
                                ) : (
                                    <Github className="h-4 w-4 text-zinc-400" />
                                )}
                                <span className="text-sm font-medium text-zinc-300">
                                    {userLogin || 'Connected'}
                                </span>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                <Search className="h-4 w-4" />
                            </div>
                            <Input
                                placeholder="Search repositories..."
                                className="pl-10 bg-transparent border-zinc-800 text-white placeholder:text-zinc-600 h-10 rounded-md focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/20 transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    {/* Repo List */}
                    <div className="flex flex-col gap-0 min-h-[400px] border border-zinc-800 rounded-md overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center flex-1 py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
                            </div>
                        ) : error ? (
                            <div className="text-center py-10 text-red-400 text-sm">
                                {error}
                            </div>
                        ) : (
                            <>
                                {repos.map((repo) => (
                                    <div
                                        key={repo.id}
                                        onClick={() => handleRepoClick(repo, false)}
                                        className={`group relative flex items-center justify-between p-4 bg-black hover:bg-zinc-900 transition-colors cursor-pointer border-b border-zinc-800 last:border-0 ${importingRepoId === repo.id ? 'opacity-70' : ''}`}
                                    >
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="h-10 w-10 shrink-0 rounded-md flex items-center justify-center bg-zinc-900 border border-zinc-800">
                                                {repo.private ? <div className="h-3 w-3 rounded-full bg-zinc-600"/> : <Github className="h-5 w-5 text-white" />}
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <h3 className="font-medium text-white text-sm">{repo.name}</h3>
                                                <div className="flex items-center gap-3 text-xs text-zinc-500">
                                                    <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
                                                    {repo.language && (
                                                        <>
                                                            <span>•</span>
                                                            <div className="flex items-center gap-1.5 text-zinc-500">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                                                                <span>{repo.language}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRepoClick(repo, true);
                                            }}
                                            className="bg-white text-black hover:bg-zinc-200 h-8 px-4 font-medium text-xs rounded-md"
                                        >
                                            {importingRepoId === repo.id ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                "Import"
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </>
                        )}

                        {!loading && repos.length === 0 && (
                            <div className="text-center py-20 flex flex-col items-center gap-4">
                                <div className="p-4 rounded-full bg-zinc-900/50 border border-zinc-800">
                                    <Search className="h-6 w-6 text-zinc-600" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">No repositories found</p>
                                    <p className="text-zinc-500 text-sm mt-1">Try adjusting your search terms</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-zinc-500 font-medium">Page {currentPage}</span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrev}
                                disabled={currentPage <= 1 || loading}
                                className="bg-transparent border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white h-8 w-8 p-0 rounded-md transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNext}
                                disabled={!hasNextPage || loading}
                                className="bg-transparent border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white h-8 w-8 p-0 rounded-md transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Preview */}
        <div className="w-full lg:w-2/5">
            <div className={`sticky top-32 rounded-xl border border-zinc-800 overflow-hidden flex flex-col min-h-[500px] transition-all duration-300 ${!previewData ? 'bg-black' : 'bg-black'}`}>
                 {previewData ? (
                    <div className="flex flex-col h-full relative animate-in fade-in">
                        {/* Preview Header */}
                        <div className="p-8 border-b border-zinc-800 bg-black">
                             <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                       <Github className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white leading-tight tracking-tight">{previewData.name}</h2>
                                        <a
                                            href={previewData.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors mt-1"
                                        >
                                            {previewData.full_name}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border border-zinc-800 bg-zinc-900 text-zinc-400">
                                    {previewData.private ? 'Private' : 'Public'}
                                </span>
                             </div>

                             <Button
                                onClick={() => setShowConfig(true)}
                                className="w-full bg-white text-black hover:bg-zinc-200 h-10 text-sm font-semibold rounded-md transition-colors"
                             >
                                <Import className="mr-2 h-4 w-4" />
                                Deploy Project
                             </Button>
                        </div>

                         {/* Directory Tree Preview */}
                         {previewData.directories && previewData.directories.length > 0 && (
                             <div className="px-6 pt-6 pb-2 border-b border-zinc-800">
                                 <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 px-2">
                                     Repository Structure
                                 </h3>
                                 <div className="bg-zinc-900/10 border border-zinc-800/50 rounded-lg p-2 max-h-[300px] overflow-y-auto min-h-[100px]">
                                     {previewData.directories.map((dir, i) => (
                                         <FileTreeItem key={`${dir.path}-${i}`} node={dir} />
                                     ))}
                                 </div>
                             </div>
                         )}

                        {/* Recent Activity */}
                        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                                Recent Activity
                            </h3>

                            <div className="space-y-3">
                                {previewData.commits && previewData.commits.length > 0 ? (
                                    previewData.commits.slice(0, 5).map((commit, i) => (
                                        <div key={i} className="flex flex-col gap-1 p-3 rounded-md border border-zinc-800 bg-zinc-900/10">
                                            <p className="text-sm text-zinc-200 font-medium line-clamp-1">{commit.message}</p>
                                            <div className="flex items-center justify-between text-xs text-zinc-500 mt-1">
                                                <span className="font-medium text-zinc-400">{commit.author}</span>
                                                <span className="font-mono opacity-70">{new Date(commit.time).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-zinc-600 text-sm py-8 border border-dashed border-zinc-800 rounded-md">
                                        No recent commits found.
                                    </div>
                                )}
                            </div>
                        </div>

                         {/* Language Stats Footer */}
                         {previewData.languages && Object.keys(previewData.languages).length > 0 && (
                            <div className="p-6 border-t border-zinc-800 bg-black">
                                 <div className="flex h-2 w-full overflow-hidden rounded-full bg-zinc-900 mb-3">
                                    {(() => {
                                        const total = Object.values(previewData.languages).reduce((a, b) => a + b, 0);
                                        const colors = ['bg-zinc-100', 'bg-zinc-300', 'bg-zinc-500', 'bg-zinc-700'];
                                        return Object.entries(previewData.languages).map(([lang, count], i) => (
                                            <div
                                                key={lang}
                                                className={`h-full ${colors[i % colors.length]}`}
                                                style={{ width: `${(count / total) * 100}%` }}
                                            />
                                        ));
                                    })()}
                                 </div>
                                 <div className="flex flex-wrap gap-x-4 gap-y-2">
                                      {Object.keys(previewData.languages).slice(0, 4).map((lang, i) => (
                                        <div key={lang} className="flex items-center gap-2 text-[10px] font-medium text-zinc-400">
                                            <div className={`h-2 w-2 rounded-full ${['bg-zinc-100', 'bg-zinc-300', 'bg-zinc-500', 'bg-zinc-700'][i % 4]}`} />
                                            <span>{lang}</span>
                                        </div>
                                    ))}
                                 </div>
                            </div>
                        )}
                    </div>
                 ) : (
                     <div className="flex flex-col items-center justify-center flex-1 h-full text-zinc-600 gap-6 p-10 text-center">
                         <div className="p-6 rounded-full bg-zinc-900 border border-zinc-800">
                             <Command className="h-8 w-8 text-zinc-600" />
                         </div>

                         <div className="max-w-[240px] space-y-1">
                            <h3 className="text-white text-sm font-medium">No Repository Selected</h3>
                            <p className="text-xs text-zinc-500">
                                Select a repository to see details.
                            </p>
                         </div>

                         <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800">
                             <Terminal className="h-3 w-3" />
                             <span>Ready...</span>
                         </div>
                     </div>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
}
