import { Loader2 } from "lucide-react";

export function DeploymentStatusPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white relative overflow-hidden">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      <div className="z-10 flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative">
             <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
             <Loader2 className="h-12 w-12 text-white animate-spin relative z-10" />
        </div>
        
        <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Working under the process</h1>
            <p className="text-zinc-500 text-sm">Your deployment has been initiated. This may take a few moments.</p>
        </div>
      </div>
    </div>
  );
}
