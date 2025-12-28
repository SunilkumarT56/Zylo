import { useState } from "react";
import { Loader2, AlertCircle, Globe, GitBranch, ChevronDown, Search } from "lucide-react";

interface LogLine {
    id: number;
    timestamp: string;
    message: string;
    type: 'info' | 'error' | 'success' | 'warning';
}

export function DeploymentProgress() {
    // Mock Data
    const [status] = useState<'queued' | 'building' | 'error' | 'ready'>('error'); // Start with error as requested in screenshot
    const [elapsedTime] = useState("1m 14s");
    
    // Mock Logs
    const [logs] = useState<LogLine[]>([
        { id: 7, timestamp: "21:49:13.275", message: "Vercel CLI 50.1.3", type: 'info' },
        { id: 8, timestamp: "21:49:13.412", message: "> Detected Turbo. Adjusting default settings...", type: 'info' },
        { id: 9, timestamp: "21:49:13.903", message: "Running 'install' command: `pnpm install`...", type: 'info' },
        { id: 10, timestamp: "21:49:14.458", message: "Scope: all 12 workspace projects", type: 'info' },
        { id: 11, timestamp: "21:49:14.537", message: "../..                                    | WARN Ignoring not compatible lockfile at /vercel/path0/pnpm-lock.yaml", type: 'warning' },
        { id: 12, timestamp: "21:49:14.568", message: "WARN GET https://registry.npmjs.org/turbo error (ERR_INVALID_THIS). Will retry in 10 seconds. 2 retries left.", type: 'warning' },
        { id: 13, timestamp: "21:49:14.568", message: "WARN GET https://registry.npmjs.org/typescript error (ERR_INVALID_THIS). Will retry in 10 seconds. 2 retries left.", type: 'warning' },
        { id: 14, timestamp: "21:49:14.569", message: "WARN GET https://registry.npmjs.org/tsx error (ERR_INVALID_THIS). Will retry in 10 seconds. 2 retries left.", type: 'warning' },
        { id: 15, timestamp: "21:50:24.579", message: "ERR_PNPM_META_FETCH_FAIL GET https://registry.npmjs.org/turbo: Value of \"this\" must be of type URLSearchParams", type: 'error' },
        { id: 16, timestamp: "21:50:24.583", message: "Command \"pnpm install\" exited with 1", type: 'error' },
    ]);

    const [activeTab, setActiveTab] = useState("Deployment");

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20">
            {/* Top Navigation Bar - Similar to Vercel's project nav */}
            <div className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-12 flex items-center gap-6 overflow-x-auto no-scrollbar">
                     {["Deployment", "Logs", "Resources", "Source", "Open Graph"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-sm font-medium h-full border-b-2 transition-colors px-1 ${
                                activeTab === tab 
                                ? "border-white text-white" 
                                : "border-transparent text-zinc-500 hover:text-zinc-300"
                            }`}
                        >
                            {tab}
                        </button>
                     ))}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                
                {/* Status Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Status Panel */}
                    <div className={`col-span-2 rounded-lg border ${status === 'error' ? 'border-red-900/50 bg-red-950/10' : 'border-zinc-800 bg-zinc-900/10'} overflow-hidden`}>
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center border ${
                                    status === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-zinc-800 border-zinc-700 text-white'
                                }`}>
                                    {status === 'error' ? (
                                        <AlertCircle className="h-5 w-5" />
                                    ) : (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h2 className={`text-lg font-medium ${status === 'error' ? 'text-red-400' : 'text-white'}`}>
                                        {status === 'error' ? 'Build Failed' : 'Building...'}
                                    </h2>
                                    <p className="text-sm text-zinc-400 font-mono">
                                        {status === 'error' ? 'Command "pnpm install" exited with 1' : 'Running build command...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meta Info Panel */}
                    <div className="col-span-1 rounded-lg border border-zinc-800 bg-zinc-900/10 p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-y-4">
                            <div className="space-y-1">
                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Status</span>
                                <div className="flex items-center gap-2 text-sm text-zinc-300">
                                    <div className={`h-2 w-2 rounded-full ${status === 'error' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'}`} />
                                    {status === 'error' ? 'Error' : 'Building'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Environment</span>
                                <div className="flex items-center gap-2 text-sm text-zinc-300">
                                    Production
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Duration</span>
                                <p className="text-sm text-zinc-300">{elapsedTime}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Created</span>
                                <p className="text-sm text-zinc-300">Just now</p>
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-zinc-800 space-y-3">
                            <div className="space-y-1">
                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Domains</span>
                                <div className="space-y-1">
                                    <a href="#" className="flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white hover:underline truncate">
                                        <Globe className="h-3 w-3" />
                                        zylo-dashboard-git-main.vercel.app
                                    </a>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Source</span>
                                <div className="flex items-center gap-2 text-sm text-zinc-300">
                                    <GitBranch className="h-3 w-3" />
                                    <span className="font-mono">main</span>
                                    <span className="text-zinc-600">•</span>
                                    <span className="font-mono text-xs text-zinc-500">88f5f9c</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Log Viewer */}
                <div className="rounded-lg border border-zinc-800 bg-black overflow-hidden shadow-2xl">
                     <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/20">
                        <div className="flex items-center gap-2">
                             <button className="flex items-center gap-2 text-sm font-medium text-white hover:bg-zinc-800 px-2 py-1 rounded transition-colors">
                                 <ChevronDown className="h-4 w-4" />
                                 Build Logs
                             </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-zinc-500 font-mono">{elapsedTime}</span>
                            <div className="h-4 w-[1px] bg-zinc-800"></div>
                            <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 rounded px-2 py-1">
                                <Search className="h-3 w-3" />
                                <span>Find in logs</span>
                                <kbd className="ml-2 font-mono text-[10px] bg-zinc-800 px-1 rounded">⌘F</kbd>
                            </div>
                        </div>
                     </div>

                     <div className="p-4 font-mono text-xs md:text-sm overflow-x-auto min-h-[400px] max-h-[600px] overflow-y-auto">
                         <div className="flex flex-col gap-0.5">
                             {logs.map((log) => (
                                 <div key={log.id} className="group flex gap-4 hover:bg-zinc-900/50 py-0.5 px-2 -mx-2 rounded">
                                     <span className="text-zinc-600 w-24 shrink-0 select-none">{log.timestamp}</span>
                                     <span className={`break-all ${
                                         log.type === 'error' ? 'text-red-400' :
                                         log.type === 'warning' ? 'text-yellow-600' :
                                         'text-zinc-300'
                                     }`}>
                                         {log.message}
                                     </span>
                                 </div>
                             ))}
                             
                             {/* Mock Typing Cursor for active build */}
                             {status === 'building' && (
                                 <div className="group flex gap-4 py-0.5 px-2 -mx-2">
                                     <span className="text-zinc-600 w-24 shrink-0 select-none">...</span>
                                     <span className="w-2 h-4 bg-zinc-500 animate-pulse block"></span>
                                 </div>
                             )}
                         </div>
                     </div>
                </div>

            </main>
        </div>
    );
}
