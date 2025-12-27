import { useState, useEffect } from "react";
import { Search, Github, ChevronRight, ChevronLeft, Loader2, ExternalLink } from "lucide-react";
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
  directories?: { name: string; path: string }[];
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
  const [commitPage, setCommitPage] = useState(1);
  const [manualRepoUrl, setManualRepoUrl] = useState("");
  const [manualImportLoading, setManualImportLoading] = useState(false);
  
  // Configuration State
  const [showConfig, setShowConfig] = useState(false);
  const [deploying, setDeploying] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRepos = async () => {
      setLoading(true);
      setError(null);
      try {
        let token = localStorage.getItem("authToken");

        // Fallback to hardcoded token if no dynamic token found (Preserving user's testing token)
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
        
        // Expected format: { login, avatar_url, page, per_page, hasNextPage, repos: [] }
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
            console.error("No owner found for repo");
            return;
        }

        // Endpoint varies based on action
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

            // Updated check to handle specific backend response structure for directories
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
                    directories: data.directories, // Using data.directories from backend
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
                    directories: [],
                    owner: {
                        login: data.owner?.login || owner,
                        avatar_url: data.owner?.avatar_url || userAvatar || ""
                    }
                };
            }
            
            setPreviewData(robustData);
            setCommitPage(1);
            
            // Only switch to config if explicitly requested (Action button)
            if (isImportAction) {
                setShowConfig(true);
            } else {
                setShowConfig(false); // Ensure we stay on preview if just clicking the row
            }
        } else {
            console.error("Failed to fetch data from " + endpoint);
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
            // For manual import, API might return owner, if not use placeholder
            if (!data.owner && userLogin) {
                 data.owner = { login: userLogin, avatar_url: userAvatar || "" };
            }
            setPreviewData(data);
            setCommitPage(1); 
            setError(null);
            setShowConfig(true); // Switch to config view
        } else {
            console.error("Failed to generate preview from URL");
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
            console.log("Deployment successful:", data);
            
            // Redirect to deploying page if status is true
            if (data.status === true) {
                 navigate("/deploying");
            } else {
                 setShowConfig(false);
                 setImportingRepoId(null); 
            }
        } else {
            console.error("Deployment failed");
            const errData = await response.json().catch(() => ({}));
            console.error(errData);
            setError("Deployment failed. Please try again.");
        }
      } catch (error) {
          console.error("Error deploying:", error);
          setError("An error occurred during deployment.");
      } finally {
          setDeploying(false);
      }
  };

  // If showing config page, override the main layout
  if (showConfig && previewData) {
      return (
          <div className="min-h-screen bg-black text-white pt-24 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
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
    <div className="min-h-screen bg-black text-white pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      
      {/* Left Column: Search & Repos */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        {/* Manual Import Input */}
        <div className="flex gap-2">
            <Input 
                placeholder="Enter GitHub URL to deploy..." 
                className="bg-black border-zinc-800 text-white placeholder:text-zinc-600 h-10 rounded-md focus-visible:ring-white/10 focus-visible:border-white/20 transition-all flex-1"
                value={manualRepoUrl}
                onChange={(e) => setManualRepoUrl(e.target.value)}
            />
            <Button 
                onClick={handleManualImport}
                disabled={manualImportLoading || !manualRepoUrl.trim()}
                className="bg-white text-black hover:bg-zinc-200 border border-white h-10 px-4 font-bold tracking-tight rounded-md transition-all shrink-0 disabled:opacity-50"
            >
                {manualImportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Import"}
            </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Your Repositories</h1>
          <p className="text-zinc-400">Select a repository to import.</p>
        </div>

        {/* GitHub Account Info */}
        <div className="flex items-center gap-3 p-3 -mt-2 rounded-lg border border-zinc-800 bg-zinc-900/30">
             <div className="p-0.5 rounded-full bg-white/5 border border-white/5 text-zinc-400 overflow-hidden h-8 w-8 flex items-center justify-center">
                {userAvatar ? (
                    <img src={userAvatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                    <Github className="h-4 w-4" />
                )}
             </div>
             <div className="flex-1 flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Connected Account</span>
                <span className="text-sm font-medium text-zinc-200">
                    {userLogin ? `github.com/${userLogin}` : 'github.com/...'}
                </span>
             </div>
             <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
        </div>



        {/* Search Bar */}
        <div className="relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <Search className="h-4 w-4" />
             </div>
             <Input 
                placeholder="Search..." 
                className="pl-9 bg-black border-zinc-800 text-white placeholder:text-zinc-600 h-10 rounded-md focus-visible:ring-white/10 focus-visible:border-white/20 transition-all"
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                }}
             />
        </div>

        {/* Repo List */}
        <div className="flex flex-col gap-3 min-h-[300px]">
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
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
                            className={`flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors group cursor-pointer ${importingRepoId === repo.id ? 'opacity-75' : ''}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-white text-black shadow-sm">
                                   <Github className="h-6 w-6" />
                                </div>
                                <div className="flex flex-col justify-center gap-1">
                                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors text-base tracking-tight">{repo.name}</h3>
                                    {repo.language && (
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                                                <div className="h-1.5 w-1.5 rounded-full bg-current text-yellow-400" /> 
                                                <span className="text-[10px] font-medium text-zinc-400">{repo.language}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Button 
                                size="sm" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRepoClick(repo, true);
                                }}
                                className="bg-white text-black hover:bg-zinc-200 h-8 font-medium cursor-pointer"
                            >
                                {importingRepoId === repo.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Import"
                                )}
                            </Button>
                        </div>
                    ))}
                    
                    {repos.length === 0 && (
                        <div className="text-center py-10 text-zinc-500 text-sm">
                            No repositories found.
                        </div>
                    )}
                </>
            )}
        </div>
        
        <div className="flex justify-start gap-4 items-center">
             {currentPage > 1 && (
                 <button 
                    onClick={handlePrev}
                    disabled={loading}
                    className="flex items-center gap-1 text-zinc-500 hover:text-white text-sm font-medium transition-colors disabled:opacity-50"
                 >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                 </button>
             )}
             {hasNextPage && (
                <button 
                    onClick={handleNext}
                    disabled={loading}
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors disabled:opacity-50"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </button>
             )}
        </div>
      </div>

      {/* Right Column: Preview / Details Area */}
      <div className={`w-full lg:w-1/2 rounded-xl border border-zinc-800 bg-black overflow-hidden flex flex-col min-h-[500px]`}>
        
        {/* Top Half: Repository Preview */}
        <div className="h-1/2 border-b border-zinc-800 relative flex flex-col w-full">
            {previewData ? (
                <div className="relative z-10 p-6 flex flex-col gap-4 h-full overflow-y-auto">
                    
                    {/* Header */}
                    <div className="flex flex-col gap-2 border-b border-zinc-900 pb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl font-bold text-white tracking-tight break-all truncate">
                                    {previewData.name}
                                </h2>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border bg-zinc-950 border-zinc-800 text-zinc-400 shrink-0`}>
                                    {previewData.private ? 'Private' : 'Public'}
                                </span>
                            </div>
                            <a 
                                href={previewData.html_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors"
                            >
                                {previewData.full_name}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-2 border border-zinc-800 bg-black/50 flex flex-col items-start gap-1">
                            <span className="text-lg font-bold text-white block">{previewData.stars}</span>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-medium">Stars</span>
                        </div>
                        <div className="p-2 border border-zinc-800 bg-black/50 flex flex-col items-start gap-1">
                             <span className="text-lg font-bold text-white block">{previewData.forks}</span>
                             <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-medium">Forks</span>
                        </div>
                        <div className="p-2 border border-zinc-800 bg-black/50 flex flex-col items-start gap-1">
                            <span className="text-lg font-bold text-white block">{previewData.open_issues}</span>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-medium">Issues</span>
                        </div>
                    </div>

                    {/* Info List */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-900/50">
                            <span className="text-zinc-500">Language</span>
                            <span className="text-white">{previewData.language}</span>
                        </div>
                         <div className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-900/50">
                            <span className="text-zinc-500">Updated</span>
                            <span className="text-white">
                                {new Date(previewData.updated_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Language Bar */}
                    {previewData.languages && Object.keys(previewData.languages).length > 0 && (
                        <div className="mt-auto mb-2 space-y-2">
                             <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-zinc-900">
                                {(() => {
                                    const total = Object.values(previewData.languages).reduce((a, b) => a + b, 0);
                                    const colors = ['bg-white', 'bg-zinc-300', 'bg-zinc-500', 'bg-zinc-700'];
                                    return Object.entries(previewData.languages).map(([lang, count], i) => (
                                        <div 
                                            key={lang}
                                            className={`h-full ${colors[i % colors.length]}`}
                                            style={{ width: `${(count / total) * 100}%` }}
                                            title={`${lang}: ${((count / total) * 100).toFixed(1)}%`}
                                        />
                                    ));
                                })()}
                             </div>
                             <div className="flex gap-3 text-[10px] text-zinc-500">
                                 {Object.keys(previewData.languages).slice(0, 3).map((lang, i) => (
                                    <div key={lang} className="flex items-center gap-1">
                                        <div className={`h-1.5 w-1.5 rounded-full ${['bg-white', 'bg-zinc-300', 'bg-zinc-500', 'bg-zinc-700'][i % 4]}`} />
                                        <span>{lang}</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                         <Button 
                            onClick={() => setShowConfig(true)}
                            className="w-full bg-white text-black hover:bg-zinc-200 border border-white h-9 text-sm font-bold tracking-tight rounded-md transition-all"
                         >
                            DEPLOY
                         </Button>

                 </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2">
                    <div className="p-3 rounded-full bg-zinc-900/50 border border-zinc-800">
                        <Github className="h-6 w-6 opacity-50" />
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wider">Select Repository</span>
                </div>
            )}
        </div>

        {/* Bottom Half: Commit History */}
        <div className="h-1/2 relative bg-zinc-950/30 w-full overflow-hidden flex flex-col">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            
            {previewData?.commits && previewData.commits.length > 0 ? (
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-black/20 backdrop-blur-sm">
                        <h3 className="text-sm font-bold text-zinc-200 tracking-wide uppercase">Recent Commits</h3>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setCommitPage(prev => Math.max(1, prev - 1))}
                                disabled={commitPage === 1}
                                className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                             >
                                <ChevronLeft className="h-4 w-4 text-zinc-400" />
                             </button>
                             <button 
                                onClick={() => setCommitPage(prev => prev + 1)}
                                disabled={!((previewData.commits?.length || 0) > commitPage * 3)}
                                className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                             >
                                <ChevronRight className="h-4 w-4 text-zinc-400" />
                             </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {previewData.commits.slice((commitPage - 1) * 3, commitPage * 3).map((commit, i) => (
                            <div key={i} className="group flex flex-col gap-1 p-3 rounded-lg border border-zinc-900 bg-black/40 hover:bg-zinc-900/40 hover:border-zinc-800/50 transition-all">
                                <div className="flex justify-between items-start gap-3">
                                    <p className="text-sm text-zinc-300 font-medium leading-snug line-clamp-2 group-hover:text-white transition-colors">
                                        {commit.message}
                                    </p>
                                    <span className="text-[10px] text-zinc-600 shrink-0 font-mono mt-0.5">
                                        {new Date(commit.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="h-4 w-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[8px] font-bold text-indigo-400">
                                        {commit.author[0]?.toUpperCase()}
                                    </div>
                                    <span className="text-xs text-zinc-500">{commit.author}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full">
                    {/* Empty State */}
                 </div>
            )}
        </div>

      </div>
    
    </div>
  );
}
