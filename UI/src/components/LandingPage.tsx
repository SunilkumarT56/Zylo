import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-foreground overflow-hidden selection:bg-violet-500/30 selection:text-violet-200 font-sans">
      {/* Premium Dark Background */}
      <div className="fixed inset-0 z-0 bg-black pointer-events-none">
          {/* Defined grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_100%,transparent_100%)]"></div>
          {/* Ambient Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white tracking-tight">Zylo</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors">
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="h-9 px-4 bg-white text-black hover:bg-zinc-200 font-medium text-sm transition-all rounded-full">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative pt-32 pb-16 px-4">
        <div className="relative w-full max-w-[95%] 2xl:max-w-7xl mx-auto space-y-16">
            
            {/* HEROL: Code with Freedom (Promoted from Card) */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0A0A0A] p-8 sm:p-12 md:p-16 group min-h-[50vh] flex flex-col justify-center"
            >
                 <div className="relative z-20 max-w-4xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/20" />
                            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/20" />
                            <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/20" />
                        </div>
                        <div className="h-px bg-white/5 flex-1 w-32 max-w-[100px]" />
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-6 leading-[1.1]">
                        Code with freedom. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-white">Deploy with control.</span>
                    </h1>
                    
                    <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-8">
                         Push to git and let our automated build system handle the rest.
                         Instant rollbacks, preview deployments, and zero-downtime shipping.
                    </p>

                     <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/signup">
                            <Button size="lg" className="h-12 px-8 bg-white text-black hover:bg-zinc-200 font-bold text-base rounded-full shadow-[0_0_40px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_-5px_rgba(255,255,255,0.4)] transition-all">
                                Start Deploying
                            </Button>
                        </Link>
                         <Button variant="outline" size="lg" className="h-12 px-8 border-white/10 text-white hover:bg-white/5 hover:text-white rounded-full text-base font-medium">
                            Documentation
                        </Button>
                    </div>
                 </div>

                 {/* Hero Visual: Huge Code Editor Abstract */}
                 <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 translate-x-[10%] w-[700px] h-[500px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000 pointer-events-none select-none hidden lg:block rotate-[-5deg]">
                     <div className="font-mono text-base space-y-3 text-violet-200/50">
                         <div className="flex"><span className="text-zinc-600 w-12">01</span> <span className="text-fuchsia-400">export</span> <span className="text-blue-400">default</span> <span className="text-yellow-300">function</span> <span className="text-blue-300">Deploy</span>() {'{'}</div>
                         <div className="flex"><span className="text-zinc-600 w-12">02</span> &nbsp;&nbsp;<span className="text-fuchsia-400">const</span> <span className="text-blue-200">grid</span> = <span className="text-green-400">new</span> <span className="text-yellow-300">ScaleGrid</span>();</div>
                         <div className="flex"><span className="text-zinc-600 w-12">03</span> &nbsp;&nbsp;<span className="text-fuchsia-400">await</span> grid.<span className="text-blue-300">connect</span>(<span className="text-orange-300">"global-edge"</span>);</div>
                         <div className="flex"><span className="text-zinc-600 w-12">04</span> </div>
                         <div className="flex"><span className="text-zinc-600 w-12">05</span> &nbsp;&nbsp;<span className="text-fuchsia-400">return</span> (</div>
                         <div className="flex"><span className="text-zinc-600 w-12">06</span> &nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-green-400">Sphere</span></div>
                         <div className="flex"><span className="text-zinc-600 w-12">07</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">region</span>=<span className="text-orange-300">"auto"</span></div>
                         <div className="flex"><span className="text-zinc-600 w-12">08</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">latency</span>=<span className="text-yellow-300">{'{'}0{'}'}</span></div>
                         <div className="flex"><span className="text-zinc-600 w-12">09</span> &nbsp;&nbsp;&nbsp;&nbsp;/&gt;</div>
                         <div className="flex"><span className="text-zinc-600 w-12">10</span> &nbsp;&nbsp;);</div>
                         <div className="flex"><span className="text-zinc-600 w-12">11</span> {'}'}</div>
                         <div className="flex"><span className="text-zinc-600 w-12">12</span> <span className="text-zinc-500">// Deploying to production...</span></div>
                     </div>
                 </div>
                 
                 <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none" />
            </motion.div>

            {/* Row 2: Infrastructure Quote */}
            <div className="flex flex-col items-center justify-center text-center py-16 space-y-8">
                 <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-white max-w-5xl leading-tight">
                    Infrastructure that works quietly while <br className="hidden md:block"/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">you ship faster.</span>
                </h2>
                <p className="text-lg text-zinc-400 max-w-2xl">
                    Ship applications faster with automated builds and global deployments.
                </p>
                <Link to="/signup">
                    <Button className="h-12 px-8 bg-white text-black hover:bg-zinc-200 font-bold text-base rounded-full shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)] transition-all">
                        Start Building
                    </Button>
                </Link>
            </div>




        </div>
      </main>
    </div>
  );
}
