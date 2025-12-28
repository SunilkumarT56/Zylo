export function UsageStats() {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/50 p-6 backdrop-blur-sm">
      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6">
        Current Usage
      </h3>

      <div className="space-y-6">
        {/* Stat 1 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white font-medium">Edge Requests</span>
            <span className="text-zinc-500">24%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-[24%] bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
          </div>
          <p className="text-[10px] text-zinc-600 font-mono">24,000 / 100,000</p>
        </div>

        {/* Stat 2 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white font-medium">Bandwidth</span>
            <span className="text-zinc-500">12%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-[12%] bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
          </div>
          <p className="text-[10px] text-zinc-600 font-mono">12 GB / 100 GB</p>
        </div>

        {/* Stat 3 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white font-medium">Build Minutes</span>
            <span className="text-zinc-500">5%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-[5%] bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
          </div>
          <p className="text-[10px] text-zinc-600 font-mono">300 / 6,000</p>
        </div>
      </div>
    </div>
  );
}
