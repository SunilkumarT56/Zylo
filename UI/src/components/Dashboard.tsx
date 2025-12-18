import { useNavigate } from "react-router-dom";
import { Search, Plus, ListFilter, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProjectCard } from "./ProjectCard";
import { UsageStats } from "./UsageStats";

export function Dashboard() {
  const navigate = useNavigate();

  const projects = [
    {
      name: "application-portal-kygt",
      domain: "application-portal-kygt.vercel.app",
      repo: "SunilkumarT56/Application...",
      lastCommit: "Update multer.js",
      timeAgo: "18h ago",
    },
    {
      name: "grok-api-key",
      domain: "grok-api-key.vercel.app",
      repo: "SunilkumarT56/grok-api-key",
      lastCommit: "Connect Git Repository",
      timeAgo: "Oct 12",
    },
    {
       name: "ai-image-generator-saa-s",
       domain: "ai-image-generator-saa-s.vercel.app",
       repo: "SunilkumarT56/Ai-image-g...",
       lastCommit: "modified",
       timeAgo: "Oct 1",
    },
     {
      name: "alumni-connect-40",
      domain: "alumni-connect-40.vercel.app",
      repo: "SunilkumarT56/alumni-con...",
      lastCommit: "Add popup messages and login page",
      timeAgo: "Sep 14",
    },
     {
       name: "application-portal-lelr",
       domain: "application-portal-lelr.vercel.app",
       repo: "SunilkumarT56/Application...",
       lastCommit: "add some routes",
       timeAgo: "Sep 21",
    },
  ];

  return (
    <div className="min-h-screen bg-black pt-20 pb-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Top Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                    placeholder="Search Projects..." 
                    className="pl-9 bg-black border-white/10 text-white placeholder:text-zinc-600 h-10 rounded-md focus-visible:ring-white/10 focus-visible:border-white/20 transition-all font-sans"
                />
            </div>
            
            <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1 bg-white/5 rounded-md p-1 border border-white/5">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-white bg-white/10 rounded-sm">
                          <LayoutGrid className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-500 hover:text-white hover:bg-white/5 rounded-sm">
                          <ListFilter className="h-4 w-4" />
                      </Button>
                 </div>
                 <Button 
                    size="sm" 
                    className="h-9 bg-white text-black hover:bg-zinc-200 font-medium px-4"
                    onClick={() => navigate("/new")}
                >
                    Add New...
                    <Plus className="ml-2 h-4 w-4" />
                 </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
             {/* Sidebar - Usage - Hidden on mobile/tablet if needed, or put at bottom */}
             <div className="lg:col-span-1">
                 <div className="sticky top-24">
                    <UsageStats />
                 </div>
             </div>

             {/* Main Content - Projects Grid */}
             <div className="lg:col-span-3">
                 <div className="mb-4 flex items-end justify-between">
                     <h2 className="text-xl font-semibold text-white">Projects</h2>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {projects.map((project, i) => (
                         <ProjectCard key={i} {...project} />
                     ))}
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
}
