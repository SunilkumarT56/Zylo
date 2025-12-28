import { useNavigate } from "react-router-dom";
import { Box } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col pt-16">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 bg-background pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 flex-1 flex flex-col items-center justify-center max-w-7xl">
        
        {/* glass-panel for main content area */}
        <div className="w-full max-w-2xl flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 rounded-3xl border border-white/5 bg-zinc-900/20 backdrop-blur-sm p-12 animate-fade-in relative overflow-hidden">
            <div className="relative z-10 bg-zinc-900 p-6 rounded-full border border-zinc-800 mb-4">
                 <Box className="h-10 w-10 text-white" />
            </div>
            
            <div className="relative z-10 max-w-md space-y-2">
                <h3 className="text-xl font-semibold text-white">No projects yet</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                    Deploy your first project to get started. Zylo makes it easy to ship your applications globally.
                </p>
            </div>

            <Button 
                variant="outline"
                className="relative z-10 border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors"
                onClick={() => navigate("/new")}
            >
                Start Building
            </Button>
        </div>
      </div>
    </div>
  );
}
