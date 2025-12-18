import { GitBranch, MoreHorizontal, Activity } from "lucide-react";
import { Button } from "./ui/Button";

interface ProjectCardProps {
  name: string;
  domain: string;
  repo: string;
  lastCommit: string;
  timeAgo: string;
  status?: "ready" | "error" | "building";
}

export function ProjectCard({ name, domain, repo, lastCommit, timeAgo, status = "ready" }: ProjectCardProps) {
  return (
    <div className="group relative flex flex-col justify-between rounded-lg border border-white/5 bg-black p-4 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/5">
                 {/* Placeholder for Project Icon - using first letter */}
                 <span className="text-lg font-bold text-white uppercase">{name.charAt(0)}</span>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-white">{name}</h3>
                <a href={`https://${domain}`} target="_blank" rel="noreferrer" className="text-xs text-zinc-400 hover:text-white hover:underline transition-colors block mt-0.5">
                    {domain}
                </a>
            </div>
        </div>
        <div className="flex gap-2">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white rounded-full">
                <Activity className="h-4 w-4" /> {/* Or Status Icon */}
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white rounded-full">
                 <MoreHorizontal className="h-4 w-4" />
            </Button>
        </div>
      </div>
      
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
             <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                 <img src="https://github.com/favicon.ico" alt="GitHub" className="h-3 w-3 opacity-60" />
                 <span className="text-zinc-400 truncate max-w-[120px]">{repo}</span>
             </div>
        </div>
        <div className="text-xs text-zinc-400">
             <p className="font-medium text-white mb-0.5 truncate">{lastCommit}</p>
             <div className="flex items-center gap-2">
                 <span className="text-zinc-500">{timeAgo}</span>
                 <span className="text-zinc-600">•</span>
                 <div className="flex items-center gap-1 text-zinc-500">
                     <GitBranch className="h-3 w-3" />
                     <span>main</span>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
}
