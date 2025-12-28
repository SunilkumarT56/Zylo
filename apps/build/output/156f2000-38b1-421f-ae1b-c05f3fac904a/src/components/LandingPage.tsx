import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { ChevronRight } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden selection:bg-white/20 selection:text-white font-sans relative">
      
      {/* Background Grid & Ambient Light */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Subtle Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_100%,transparent_100%)]"></div>
          
          {/* Top light bloom (simulating sun/moon light from top) */}
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-white/5 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6 text-white" />
            <span className="text-lg font-bold text-white tracking-tight">Zylo</span>
          </div>
          
          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
             <a href="#" className="hover:text-white transition-colors">Products</a>
             <a href="#" className="hover:text-white transition-colors">Solutions</a>
             <a href="#" className="hover:text-white transition-colors">Resources</a>
             <a href="#" className="hover:text-white transition-colors">Enterprise</a>
             <a href="#" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="h-8 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="h-8 px-4 bg-white text-black hover:bg-zinc-200 font-medium text-xs transition-all rounded-md">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] pt-32 px-4 text-center">
        
        {/* Badge / Announcement */}
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
        >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-medium text-zinc-300 hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-md">
                <span className="px-1.5 py-0.5 rounded-sm bg-blue-500/20 text-blue-400 text-[9px] font-bold tracking-wider uppercase">New</span>
                Global Edge Network 2.0 is live
                <ChevronRight className="h-3 w-3 text-zinc-500" />
            </span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white max-w-5xl leading-[0.95] mb-8"
        >
            Ship fast. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-400 to-zinc-600">Scale instantly.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.7, delay: 0.2 }}
             className="text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-10 antialiased"
        >
             Zylo provides the infrastructure, automation, and global edge network 
             developers need to build and deploy their best work.
        </motion.p>

        {/* CTAs */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
            <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-white text-black hover:bg-zinc-200 font-bold text-sm tracking-tight rounded-full transition-all">
                    Start Deploying
                </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white rounded-full text-sm font-medium backdrop-blur-sm">
                Get a Demo
            </Button>
        </motion.div>

        {/* Visual Effect: The "Prism" / "Core" */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[500px] pointer-events-none overflow-hidden">
             
             {/* The glowing triangle/prism shape */}
             <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[400px]">
                 {/* Main gradient cone */}
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-t from-blue-600/20 via-violet-600/10 to-transparent blur-3xl opacity-60" 
                      style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} 
                 />
                 
                 {/* Inner brighter core */}
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-gradient-to-t from-cyan-500/30 via-blue-500/10 to-transparent blur-2xl opacity-70"
                      style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} 
                 />

                 {/* Sharp lines defining the shape (The Vercel-like triangle look) */}
                 <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[250px] opacity-30" viewBox="0 0 400 250">
                     <defs>
                         <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                             <stop offset="0%" stopColor="white" stopOpacity="0" />
                             <stop offset="50%" stopColor="white" stopOpacity="0.5" />
                             <stop offset="100%" stopColor="white" stopOpacity="0" />
                         </linearGradient>
                     </defs>
                     {/* Triangle Outline */}
                     <path d="M200 0 L400 250 L0 250 Z" fill="url(#grad1)" stroke="url(#grad1)" strokeWidth="1" fillOpacity="0.05" />
                     
                     {/* Internal grid lines for sci-fi feel */}
                     <path d="M200 0 L200 250" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
                     <path d="M200 50 L100 250" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />
                     <path d="M200 50 L300 250" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />
                 </svg>
             </div>
             
             {/* Floor Reflection/Glow */}
             <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 w-[800px] h-[100px] bg-blue-500/20 blur-[80px] rounded-full" />
             
             {/* Particles */}
             <div className="absolute inset-0 w-full h-full">
                 <div className="absolute top-[40%] left-[30%] w-1 h-1 bg-white/40 rounded-full animate-pulse" />
                 <div className="absolute top-[60%] left-[70%] w-1.5 h-1.5 bg-blue-400/30 rounded-full animate-pulse delay-75" />
                 <div className="absolute top-[30%] left-[60%] w-1 h-1 bg-white/20 rounded-full animate-pulse delay-150" />
             </div>
        </div>

      </main>

    </div>
  );
}
