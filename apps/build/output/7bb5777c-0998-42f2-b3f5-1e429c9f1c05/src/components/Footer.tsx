import { Monitor } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/5 bg-black/40 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20 py-8 mt-auto z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          
          {/* Left Side: Logo & Copyright */}
          <div className="flex items-center gap-4">
            <a href="#" className="group flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="w-6 h-6">
                <Logo />
              </div>
              <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                Zylo
              </span>
            </a>
            <div className="h-4 w-px bg-zinc-800" />
            <p className="text-xs text-zinc-500">
              © {currentYear} Zylo Inc.
            </p>
          </div>

          {/* Middle: Links */}
          <nav className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-zinc-500">
            {['Home', 'Docs', 'Knowledge Base', 'Academy', 'SDKs', 'Blog'].map((item) => (
              <a 
                key={item} 
                href="#" 
                className="hover:text-zinc-200 transition-colors duration-200 ease-in-out font-medium"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Right Side: Status & System */}
          <div className="flex items-center gap-6">
            {/* System Status */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors group cursor-default">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 duration-1000"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
                Systems Normal
              </span>
            </div>

            {/* Theme / Settings (Simplified) */}
            <div className="flex items-center gap-3 text-zinc-600">
                <a href="#" className="hover:text-zinc-400 transition-colors">
                  <span className="sr-only">Settings</span>
                  <Monitor className="h-4 w-4" />
                </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
