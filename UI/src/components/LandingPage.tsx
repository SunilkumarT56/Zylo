import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden selection:bg-white/20 selection:text-white font-sans">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white tracking-tight">buildep</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="h-9 px-4 bg-white text-black hover:bg-zinc-200 font-medium text-sm transition-colors rounded-md">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-32 pb-16 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        {/* Grid Background */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl sm:text-7xl font-extrabold tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent"
          >
            Build and deploy on the <br/> AI Cloud.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Buildep provides the developer tools and cloud infrastructure to build, scale, and secure a faster, more personalized web.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link to="/signup">
                <Button size="lg" className="h-12 px-8 bg-white text-black hover:bg-zinc-200 font-semibold text-base rounded-full">
                Start Deploying
                </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-12 px-8 border-white/10 bg-transparent text-white hover:bg-white/5 font-semibold text-base rounded-full">
              Get a Demo
            </Button>
          </motion.div>
        </div>

        {/* Triangle / Prism Effect Replica */}
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }} 
            className="mt-20 relative w-full max-w-lg aspect-auto flex justify-center"
        >
             {/* Abstract Representation of the prism */}
            <div className="relative w-64 h-64 bg-gradient-to-t from-zinc-900 to-black clip-path-triangle opacity-80 blur-2xl absolute top-10"></div>
            <div className="w-0 h-0 border-l-[100px] border-l-transparent border-r-[100px] border-r-transparent border-b-[180px] border-b-white/10 blur-md relative z-10"></div>
             {/* Colorful glows */}
             <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-blue-500/30 rounded-full blur-[80px]"></div>
             <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-red-500/30 rounded-full blur-[80px]"></div>
        </motion.div>
      </main>
    </div>
  );
}
