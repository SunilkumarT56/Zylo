import { GitBranch, MoreHorizontal, Globe, Clock, ArrowUpRight } from "lucide-react";
import { Button } from "./ui/Button";

interface ProjectCardProps {
  name: string;
  domain: string;
  repo: string;
  lastCommit: string;
  timeAgo: string;
  status?: "ready" | "error" | "building";
}

export function ProjectCard({ name, domain, repo, lastCommit, timeAgo, status: _status = "ready" }: ProjectCardProps) {
  // Determine status color
  const statusColor = _status === "ready" ? "bg-emerald-500" : _status === "error" ? "bg-red-500" : "bg-amber-500";
  const statusGlow = _status === "ready" ? "shadow-[0_0_10px_rgba(16,185,129,0.4)]" : _status === "error" ? "shadow-[0_0_10px_rgba(239,68,68,0.4)]" : "shadow-[0_0_10px_rgba(245,158,11,0.4)]";

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md p-5 hover:border-white/10 hover:bg-zinc-900/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-primary/20 transition-colors duration-500" />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-4">
            <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 shadow-inner overflow-hidden`}>
                 <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <span className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-400 group-hover:from-primary-foreground group-hover:to-primary-foreground/80 uppercase">{name.charAt(0)}</span>
            </div>
            <div>
                <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-primary transition-colors">{name}</h3>
                <a href={`https://${domain}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mt-0.5 group/link">
                    <Globe className="h-3 w-3" />
                    <span>{domain}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover/link:opacity-100 transition-all" />
                </a>
            </div>
        </div>
        <div className="flex gap-1">
             <div className="flex flex-col items-end gap-1 mr-2">
                 <div className={`h-2.5 w-2.5 rounded-full ${statusColor} ${statusGlow} ring-2 ring-black/50`} />
             </div>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                 <MoreHorizontal className="h-4 w-4" />
            </Button>
        </div>
      </div>
      
      <div className="mt-8 space-y-4 relative z-10">
        <div className="flex items-center gap-2 text-xs text-zinc-500 bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/5 hover:border-white/10 transition-colors">
            <img src="https://github.com/favicon.ico" alt="GitHub" className="h-3.5 w-3.5 opacity-70 grayscale group-hover:grayscale-0 transition-all" />
            <span className="text-zinc-300 font-medium truncate max-w-[140px] tracking-wide">{repo}</span>
        </div>
        
        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
             <div className="flex items-center gap-2">
                 <GitBranch className="h-3.5 w-3.5 text-zinc-500" />
                 <span className="font-mono text-zinc-300 bg-white/5 px-1.5 py-0.5 rounded text-[10px]">main</span>
                 <span className="truncate max-w-[120px]">{lastCommit}</span>
             </div>
             <div className="flex items-center gap-1.5 min-w-fit">
                 <Clock className="h-3.5 w-3.5 text-zinc-500" />
                 <span>{timeAgo}</span>
             </div>
        </div>
      </div>
    </div>
  );
}
