import { LogOut, ChevronDown, Check, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { Logo } from "@/components/Logo";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  onLogout: () => void;
  userEmail?: string | null;
  userId?: string | null;
  userAvatarUrl?: string | null;
  userName?: string | null;
}

export function Header({ onLogout, userEmail, userAvatarUrl, userName }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  const displayUsername = userName || (userEmail ? userEmail.split('@')[0] : 'User');

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl h-16 flex items-center justify-between">
        {/* Left Side: Logo + Profile Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-white/5">
                <Logo className="h-4 w-4 text-primary" />
             </div>
            <span className="text-sm font-bold text-white tracking-wide hidden sm:inline-block">Zylo</span>
          </div>

          {/* Separator / Breadcrumb */}
          <div className="h-4 w-[1px] bg-white/10 rotate-[20deg] mx-2" />

          {/* User Profile Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-white/5 transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-primary/50 border border-transparent hover:border-white/5"
            >
              {/* Avatar Gradient or Image */}
              {userAvatarUrl ? (
                <img 
                  src={userAvatarUrl} 
                  alt={displayUsername} 
                  className="w-5 h-5 rounded-full border border-white/10 object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary via-purple-500 to-pink-500 border border-white/10 shadow-inner" />
              )}
              
              <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors max-w-[150px] truncate hidden sm:inline-block">
                {displayUsername}
              </span>
              
              <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-full left-0 mt-2 w-64 bg-[#0A0A0A]/95 border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 p-1 backdrop-blur-2xl"
                >
                  <div className="p-3 border-b border-white/5 space-y-1 bg-white/5 rounded-t-lg mx-1 mt-1">
                    <p className="text-sm font-medium text-white truncate">{displayUsername}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{userEmail || 'No email connected'}</p>
                  </div>

                  <div className="py-1 mt-1">
                    <div className="flex items-center justify-between px-3 py-2 text-xs text-zinc-300 bg-white/5 rounded-md mx-1 border border-white/5 cursor-default">
                        <div className="flex items-center gap-2">
                             {userAvatarUrl ? (
                                <img 
                                  src={userAvatarUrl} 
                                  alt={displayUsername} 
                                  className="w-4 h-4 rounded-full border border-white/10 object-cover"
                                />
                             ) : (
                                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-primary via-purple-500 to-pink-500 flex items-center justify-center text-[8px] text-white font-bold">
                                    {displayUsername.charAt(0).toUpperCase()}
                                </div>
                             )}
                            <span className="truncate max-w-[140px]">{displayUsername}</span>
                        </div>
                        <Check className="w-3 h-3 text-primary" />
                    </div>
                  </div>

                  <div className="py-1 border-t border-white/5 mt-1">
                     <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors text-left font-medium">
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
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline-block">Dashboard</span>
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="h-8 text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors rounded-full px-3"
          >
            <LogOut className="mr-2 h-3 w-3" />
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
