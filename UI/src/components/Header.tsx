import { LogOut } from "lucide-react";
import { Button } from "./ui/Button";
import { Logo } from "@/components/Logo";

interface HeaderProps {
  onLogout: () => void;
  userEmail?: string | null;
}

export function Header({ onLogout, userEmail }: HeaderProps) {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-white" />
          <span className="text-xl font-bold text-white tracking-tight">Zylo</span>
        </div>
        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="text-sm text-zinc-400 hidden sm:inline-block">
              {userEmail}
            </span>
          )}
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
