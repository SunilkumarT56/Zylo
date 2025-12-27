import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col pt-16">
      {/* Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="container mx-auto px-4 z-10 flex-1 flex flex-col">
        {/* Header with Title and New Project Button */}
        <div className="py-8 border-b border-white/5 flex items-center justify-end">
           <Button 
                size="sm" 
                className="bg-white text-black hover:bg-zinc-200 font-medium px-4 shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate("/new")}
            >
                <Plus className="mr-2 h-4 w-4" />
                New Project
            </Button>
        </div>

        {/* Empty State / Main Content - Now completely empty as requested */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            {/* Content removed as requested */}
        </div>
      </div>
    </div>
  );
}
