import { Button } from "./ui/Button";

export function UsageStats() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
           <h3 className="text-sm font-medium text-zinc-200">Usage</h3>
           <span className="text-sm text-zinc-500">Last 30 days</span>
       </div>
       
       <div className="space-y-4">
            {/* Stat Row */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Edge Requests</span>
                    <span className="text-zinc-200">33 / 1M</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
                    <div className="h-full w-[0.01%] bg-blue-500 rounded-full" />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Fast Data Transfer</span>
                    <span className="text-zinc-200">1.37 MB / 100 GB</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
                    <div className="h-full w-[0.1%] bg-purple-500 rounded-full" />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Fast Origin Transfer</span>
                    <span className="text-zinc-200">0 / 10 GB</span>
                </div>
                 <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
                    <div className="h-full w-0 bg-white rounded-full" />
                </div>
            </div>
            
             <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Function Invocations</span>
                    <span className="text-zinc-200">0 / 1M</span>
                </div>
                 <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
                    <div className="h-full w-0 bg-white rounded-full" />
                </div>
            </div>
       </div>
       
       <div className="pt-2">
           <Button variant="outline" size="sm" className="w-full text-xs h-8 border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10">
               Upgrade to Pro
           </Button>
       </div>
    </div>
  );
}
