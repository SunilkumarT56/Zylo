import { Loader2, Terminal, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function DeploymentStatusPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white relative overflow-hidden font-sans">
      {/* Background with Grid and Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[100px] rounded-full mix-blend-screen opacity-40 animate-pulse-slow" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_100%,transparent_100%)]"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="z-10 w-full max-w-2xl px-6"
      >
        <div className="glass-panel overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
                    <Terminal className="h-4 w-4" />
                    <span>Deployment Logs</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                </div>
            </div>

            {/* Content Body */}
            <div className="p-8 flex flex-col items-center text-center space-y-8 min-h-[300px] justify-center relative">
                 {/* Animated Rings */}
                <div className="relative">
                     <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                     <div className="relative z-10 h-20 w-20 rounded-full bg-black/50 border border-white/10 flex items-center justify-center ring-4 ring-white/5 shadow-2xl">
                         <Loader2 className="h-8 w-8 text-primary animate-spin" />
                     </div>
                     
                     {/* Orbiting particles (css based) */}
                     <div className="absolute inset-0 w-full h-full animate-[spin_3s_linear_infinite]">
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />
                     </div>
                </div>
                
                <div className="space-y-3 max-w-md">
                    <h2 className="text-2xl font-bold tracking-tight text-white">Initializing Deployment Environment</h2>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        We are provisioning your build containers and setting up the global edge network. This usually takes less than a minute.
                    </p>
                </div>

                {/* Simulated Steps */}
                <div className="w-full max-w-sm space-y-3 pt-4">
                    <div className="flex items-center gap-3 text-sm text-zinc-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="opacity-50 line-through">Verifying repository access</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="opacity-50 line-through">Analyzing project structure</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-white">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="font-medium">Allocating build resources...</span>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
