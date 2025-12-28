import { GitBranch, MoreHorizontal, ArrowUpRight, Github } from 'lucide-react';
import { Logo } from '@/components/Logo';

interface ProjectCardProps {
  name: string;
  domain: string;
  repo: string;
  lastCommitMessage: string;
  timeAgo: string;
  branch?: string;
}

export function ProjectCard({
  name,
  domain,
  repo,
  lastCommitMessage,
  timeAgo,
  branch = 'main',
}: ProjectCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-950 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]">
      {/* Hover Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative p-5 flex flex-col h-full justify-between">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white shrink-0">
              <Logo className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight leading-none mb-1">
                {name}
              </h3>
              <a
                href={`https://${domain}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-zinc-500 hover:text-white transition-colors font-medium flex items-center gap-1"
              >
                {domain}
              </a>
            </div>
          </div>

          <a
            href={`https://${domain}`}
            target="_blank"
            rel="noreferrer"
            className="h-8 w-8 flex items-center justify-center rounded-full bg-transparent hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        {/* Status / Commit */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 self-start">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-medium text-zinc-300 uppercase tracking-wide">
              {lastCommitMessage.replace('Deployment ', '')}
            </span>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
              <Github className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{repo}</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-600">
              <div className="flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                <span className="font-mono">{branch}</span>
              </div>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
