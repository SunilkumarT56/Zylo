import { useState, useEffect } from "react";
import { GitBranch, Github, ChevronDown, ChevronRight, Loader2, Folder } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Directory {
    name: string;
    path: string;
    children?: Directory[];
    type?: 'file' | 'dir';
}

interface ImportConfigurationProps {
  repo: {
    name: string;
    full_name: string;
    default_branch: string;
    html_url: string;
    owner?: {
        login: string;
        avatar_url: string;
    };
    directories?: Directory[];
  };
  onBack: () => void;
  onDeploy: (config: ProjectConfig) => Promise<void>;
  loading: boolean;
}

export interface ProjectConfig {
  projectName: string;
  framework: string;
  rootDirectory: string;
  buildCommand?: string;
  outputDirectory?: string;
  installCommand?: string;
  envVars: { key: string; value: string }[];
}

const FileTreeItem = ({ 
    node: initialNode, 
    level = 0, 
    onSelect, 
    currentPath,
    repoName,
    owner,
    defaultOpen = false
}: { 
    node: Directory; 
    level?: number; 
    onSelect: (path: string) => void;
    currentPath: string;
    repoName: string;
    owner: string;
    defaultOpen?: boolean;
}) => {
    const [node, setNode] = useState(initialNode);
    // Sync state with props when they change
    useEffect(() => {
        setNode(initialNode);
    }, [initialNode]);

    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [loading, setLoading] = useState(false);
    const hasChildren = node.children && node.children.length > 0;
    const isExpandable = node.type === 'dir';
    
    // Normalize paths for comparison (remove trailing slashes, ./ prefixes)
    const normalize = (p: string) => p.replace(/^\.\/?/, '').replace(/\/$/, '');
    const isSelected = normalize(node.path) === normalize(currentPath);

    const handleExpand = async (e: React.MouseEvent, forceOpen?: boolean) => {
        e.stopPropagation();
        
        if (!isExpandable) return;
        
        // If already open and we're not forcing it, just toggle close
        if (isOpen && !forceOpen) {
            setIsOpen(false);
            return;
        }

        // If simple toggle (already has children or not expandable), just open
        if (hasChildren || !isExpandable) {
            setIsOpen(true);
            return;
        }

        // Fetch children
        setLoading(true);
        setIsOpen(true);
        
        try {
            let token = localStorage.getItem("authToken");
            if (!token) {
                 token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZTgwZjM5Mi1hN2NlLTQwYjUtOTc3Zi0xNjM5YjU3MjZkYTMiLCJpYXQiOjE3NjY1MDA2MzIsImV4cCI6MTc2NzEwNTQzMn0.NniSk_TnqLk3uRoyp9WrNkf4h_GQJe0Z3zKvEQX48Lg";
            }

            const response = await fetch("https://untolerative-len-rumblingly.ngrok-free.dev/user/new/inner-dir", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify({
                    owner,
                    repoName,
                    path: node.path
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.directories) {
                    setNode(prev => ({
                        ...prev,
                        children: data.directories
                    }));
                }
            }
        } catch (error) {
            console.error("Error fetching inner directories:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="select-none"
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(node.path);
                    // On click, ensure it's open, don't toggle closed if already open
                    if (isExpandable && !isOpen) handleExpand(e, true);
                }}
                onMouseEnter={(e) => {
                    e.stopPropagation();
                    if (isExpandable && !isOpen) handleExpand(e, true);
                }}
                className={`w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors group ${isSelected ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
                {isExpandable ? (
                    <span className={`transition-colors ${isSelected ? 'text-zinc-300' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </span>
                ) : (
                    <span className="w-4" /> 
                )}
                
                <Folder className={`h-4 w-4 transition-colors ${isSelected ? 'text-blue-400' : (isOpen ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300')}`} />
                
                <span className="font-mono text-xs truncate">{node.name}</span>
                
                {isSelected && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                )}
            </button>
            
            {isOpen && node.children && (
                <div className="animate-in slide-in-from-top-1 fade-in duration-200">
                    {node.children.map((child, i) => (
                        <FileTreeItem 
                            key={`${child.path}-${i}`} 
                            node={child} 
                            level={level + 1} 
                            onSelect={onSelect}
                            currentPath={currentPath}
                            repoName={repoName}
                            owner={owner}
                            defaultOpen={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export function ImportConfiguration({ repo, onBack, onDeploy, loading }: ImportConfigurationProps) {
  const [projectName, setProjectName] = useState(repo.name);
  const [framework, setFramework] = useState("Vite");
  const [rootDirectory, setRootDirectory] = useState("./");
  
  // Accordion states
  const [showBuildSettings, setShowBuildSettings] = useState(false);
  const [showEnvVars, setShowEnvVars] = useState(false);
  
  // Directory selection state
  const [showDirList, setShowDirList] = useState(false);
  // Framework detection loading state
  const [detectingFramework, setDetectingFramework] = useState(false);
  
  // Build settings
  const [buildCommand, setBuildCommand] = useState("npm run build");
  const [outputDirectory, setOutputDirectory] = useState("dist");
  const [installCommand, setInstallCommand] = useState("npm install");

  // Env vars
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([
    { key: "EXAMPLE_KEY", value: "" }
  ]);

  const handleDeploy = () => {
    onDeploy({
      projectName,
      framework,
      rootDirectory,
      buildCommand,
      outputDirectory,
      installCommand,
      envVars: envVars.filter(e => e.key && e.value)
    });
  };

  // Handle framework detection when directory changes
  const handleDirectorySelect = async (dir: string) => {
      setRootDirectory(dir);
      setShowDirList(false);
      setDetectingFramework(true);
      
      try {
        let token = localStorage.getItem("authToken");
        if (!token) {
             token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZTgwZjM5Mi1hN2NlLTQwYjUtOTc3Zi0xNjM5YjU3MjZkYTMiLCJpYXQiOjE3NjY1MDA2MzIsImV4cCI6MTc2NzEwNTQzMn0.NniSk_TnqLk3uRoyp9WrNkf4h_GQJe0Z3zKvEQX48Lg";
        }

        const response = await fetch("https://untolerative-len-rumblingly.ngrok-free.dev/user/new/framework", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({
                repoName: repo.name,
                owner: repo.owner?.login || "",
                rootDirectory: dir
            })
        });

        if (response.ok) {
            const data = await response.json();
            
            // Access nested response object structure: { status: true, response: { ... } }
            const prediction = data.response;

            if (prediction) {
                // Handle framework detection logic
                // Check if framework exists and is not 'unknown' (case-insensitive)
                if (prediction.framework && prediction.framework.toLowerCase() !== "unknown") {
                     setFramework(prediction.framework);
                     
                     // Map backend response fields to state only if valid framework
                     if (prediction.buildCommand) setBuildCommand(prediction.buildCommand);
                     if (prediction.outputDir) setOutputDirectory(prediction.outputDir); 
                     if (prediction.installCommand) setInstallCommand(prediction.installCommand);
                } else {
                     setFramework("Unknown"); // Set framework to Unknown
                     setBuildCommand("unknown");
                     setOutputDirectory("unknown");
                     setInstallCommand("unknown");
                }
            }
        }
      } catch (error) {
          console.error("Error detecting framework:", error);
      } finally {
          setDetectingFramework(false);
      }
  };

  const frameworks = ["Next.js", "Create React App", "Vite", "Vue.js", "Nuxt.js", "Svelte", "Gatsby", "Other", "Unknown"];

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={onBack}
          className="text-sm text-zinc-500 hover:text-white transition-colors mb-4 flex items-center gap-1"
        >
          ← Back to Repositories
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-white">New Project</h1>
      </div>

      <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl shadow-zinc-950/50">
        
        {/* Repo Header */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/30">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-3">Importing from GitHub</h2>
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center border border-zinc-800 text-white">
                    <Github className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                         <span className="font-semibold text-white text-lg">{repo.owner?.login || "User"} / {repo.name}</span>
                         <span className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded-full border border-zinc-700 font-mono">Public</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs mt-0.5">
                        <GitBranch className="h-3 w-3" />
                        <span className="font-mono">{repo.default_branch}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Configuration Form */}
        <div className="p-8 space-y-6 bg-black">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-zinc-500">Project Name</label>
                    <Input 
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 focus:border-white/30 transition-colors h-10 font-mono text-sm"
                        placeholder="my-app"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-zinc-500">Framework Preset</label>
                    <div className="relative">
                        <select 
                            value={framework}
                            onChange={(e) => setFramework(e.target.value)}
                            disabled={detectingFramework}
                            className={`w-full h-10 bg-zinc-950 border border-zinc-800 rounded-md px-3 text-sm text-white appearance-none focus:outline-none focus:border-white/30 transition-colors cursor-pointer ${detectingFramework ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {frameworks.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            {detectingFramework ? (
                                <Loader2 className="h-4 w-4 text-zinc-500 animate-spin" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-zinc-500" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                 <label className="text-xs uppercase tracking-wider font-semibold text-zinc-500">Root Directory</label>
                 <div className="relative">
                     <div className="flex gap-2">
                         <div className="relative flex-1">
                             <Input 
                                value={rootDirectory}
                                readOnly
                                onFocus={() => !detectingFramework && setShowDirList(true)}
                                className={`bg-zinc-950 border-zinc-800 focus:border-white/30 transition-colors h-10 font-mono text-sm w-full cursor-pointer ${detectingFramework ? 'opacity-50' : ''}`}
                                placeholder="./"
                             />
                         </div>
                         <Button 
                            variant="outline" 
                            className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white" 
                            onClick={() => !detectingFramework && setShowDirList(!showDirList)}
                            disabled={detectingFramework}
                         >
                             Edit
                         </Button>
                     </div>
                     
                     {showDirList && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="max-h-60 overflow-y-auto p-1">
                                <div className="px-2 py-1.5 text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Select Directory</div>
                                {repo.directories ? (
                                    repo.directories.map((dir, i) => (
                                        <FileTreeItem 
                                            key={`${dir.path}-${i}`} 
                                            node={dir} 
                                            onSelect={handleDirectorySelect}
                                            currentPath={rootDirectory}
                                            repoName={repo.name}
                                            owner={repo.owner?.login || ""}
                                        />
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-zinc-500 text-sm">No directories found</div>
                                )}
                            </div>
                        </div>
                     )}
                 </div>
                 <p className="text-[10px] text-zinc-600">The directory within your project where your code is located.</p>
            </div>

            {/* Accordions */}
            <div className="space-y-4 pt-2">
                
                {/* Build Settings */}
                <div className="border border-zinc-800 rounded-lg overflow-hidden">
                    <button 
                        onClick={() => setShowBuildSettings(!showBuildSettings)}
                        className="w-full flex items-center justify-between p-4 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors"
                    >
                        <span className="text-sm font-medium text-white">Build and Output Settings</span>
                        {showBuildSettings ? <ChevronDown className="h-4 w-4 text-zinc-500" /> : <ChevronRight className="h-4 w-4 text-zinc-500" />}
                    </button>
                    
                    {showBuildSettings && (
                        <div className="p-4 space-y-4 border-t border-zinc-800 bg-zinc-950/30">
                             <div className="grid gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500">Build Command</label>
                                    <Input value={buildCommand} onChange={(e) => setBuildCommand(e.target.value)} className="bg-black border-zinc-800 h-9 text-sm font-mono text-zinc-300" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500">Output Directory</label>
                                    <Input value={outputDirectory} onChange={(e) => setOutputDirectory(e.target.value)} className="bg-black border-zinc-800 h-9 text-sm font-mono text-zinc-300" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500">Install Command</label>
                                    <Input value={installCommand} onChange={(e) => setInstallCommand(e.target.value)} className="bg-black border-zinc-800 h-9 text-sm font-mono text-zinc-300" />
                                </div>
                             </div>
                        </div>
                    )}
                </div>

                {/* Env Vars */}
                <div className="border border-zinc-800 rounded-lg overflow-hidden">
                    <button 
                        onClick={() => setShowEnvVars(!showEnvVars)}
                        className="w-full flex items-center justify-between p-4 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors"
                    >
                        <span className="text-sm font-medium text-white">Environment Variables</span>
                        {showEnvVars ? <ChevronDown className="h-4 w-4 text-zinc-500" /> : <ChevronRight className="h-4 w-4 text-zinc-500" />}
                    </button>
                    
                    {showEnvVars && (
                        <div className="p-4 border-t border-zinc-800 bg-zinc-950/30">
                            {envVars.map((env, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <Input 
                                        placeholder="KEY"
                                        value={env.key}
                                        onChange={(e) => {
                                            const newTime = [...envVars];
                                            newTime[i].key = e.target.value;
                                            setEnvVars(newTime);
                                        }}
                                        className="bg-black border-zinc-800 h-9 text-sm font-mono text-zinc-300 flex-1" 
                                    />
                                    <Input 
                                        placeholder="VALUE"
                                        value={env.value}
                                        onChange={(e) => {
                                            const newTime = [...envVars];
                                            newTime[i].value = e.target.value;
                                            setEnvVars(newTime);
                                        }}
                                        className="bg-black border-zinc-800 h-9 text-sm font-mono text-zinc-300 flex-1" 
                                    />
                                </div>
                            ))}
                            <Button 
                                onClick={() => setEnvVars([...envVars, { key: "", value: "" }])}
                                variant="outline" 
                                className="w-full mt-2 border-dashed border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 h-8 text-xs"
                            >
                                + Add Another
                            </Button>
                        </div>
                    )}
                </div>

            </div>

             <div className="pt-4">
                <Button 
                    onClick={handleDeploy} 
                    disabled={loading || !projectName.trim()}
                    className="w-full bg-white text-black hover:bg-zinc-200 h-12 text-base font-bold tracking-tight transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Deploying...</span>
                        </div>
                    ) : (
                        "Deploy"
                    )}
                </Button>
             </div>

        </div>
      </div>
    </div>
  );
}
