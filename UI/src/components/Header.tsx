import { LogOut, ChevronDown, Check } from "lucide-react";
import { Button } from "./ui/Button";
import { Logo } from "@/components/Logo";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  onLogout: () => void;
  userEmail?: string | null;
  userId?: string | null;
}

export function Header({ onLogout, userEmail }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const username = userEmail ? userEmail.split('@')[0] : 'User';

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left Side: Logo + Profile Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white tracking-tight hidden sm:inline-block">Zylo</span>
          </div>

          {/* Separator / Breadcrumb */}
          <div className="h-8 w-[1px] bg-white/10 rotate-[20deg] mx-1" />

          {/* User Profile Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {/* Avatar Gradient */}
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 border border-white/10 shadow-inner" />
              
              <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors max-w-[150px] truncate hidden sm:inline-block">
                {username}
              </span>
              
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 font-medium hidden md:inline-block">
                Hobby
              </span>

              <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-full left-0 mt-2 w-64 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 p-1"
                >
                  <div className="p-2 border-b border-white/5 space-y-1">
                    <p className="text-sm font-medium text-white truncate">{username}</p>
                    <p className="text-xs text-zinc-500 truncate">{userEmail || 'No email connected'}</p>
                  </div>

                  <div className="py-1">
                    <div className="flex items-center justify-between px-2 py-2 text-sm text-zinc-300 bg-white/5 rounded-md mx-1 cursor-default">
                        <div className="flex items-center gap-2">
                             <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-[10px] text-white font-bold">
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate max-w-[140px]">{username}</span>
                        </div>
                        <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="py-1 border-t border-white/5 mt-1">
                     <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors text-left">
                        <div className="w-4 h-4 flex items-center justify-center">
                            <span className="w-3 h-3 border border-zinc-600 rounded-full border-dashed" />
                        </div>
                        Create Team
                     </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Log Out */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onLogout}
            className="h-8 border-white/10 bg-black text-xs text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="mr-2 h-3 w-3" />
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
