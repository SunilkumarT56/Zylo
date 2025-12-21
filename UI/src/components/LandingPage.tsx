import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20 selection:text-primary font-sans">
      {/* Backgrounds */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      {/* Colorful Gradient Glow - Full Page */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-emerald-500 to-red-600 blur-[150px] mix-blend-screen opacity-50" />
        <div className="absolute inset-0 bg-black/20" /> {/* Subtle darkening overlay if needed */}
      </div>

      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white tracking-tight">Zylo</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors border border-white/20">
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="h-9 px-4 bg-white text-black hover:bg-zinc-200 font-medium text-sm transition-all rounded-md">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-32 pb-16 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="relative w-full max-w-[95%] 2xl:max-w-7xl mx-auto">
            {/* Grid Border Container */}
            <div className="relative border border-white/10 p-8 sm:p-12 md:p-16">
                
                {/* Corner Markers */}
                {/* Top Left */}
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 text-white/30">
                    <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <path d="M6 0V12M0 6H12" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                </div>
                {/* Top Right */}
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 text-white/30">
                    <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <path d="M6 0V12M0 6H12" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                </div>
                {/* Bottom Left */}
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 text-white/30">
                     <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <path d="M6 0V12M0 6H12" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                </div>
                {/* Bottom Right */}
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 text-white/30">
                     <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <path d="M6 0V12M0 6H12" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                </div>
                
                 {/* Top center marker */}
                 <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 text-white/30">
                     <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <path d="M6 0V12M0 6H12" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                </div>
                 {/* Bottom center marker */}
                 <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 text-white/30">
                     <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <path d="M6 0V12M0 6H12" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                </div>


                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative group mb-8"
                >
                     <div className="relative z-10 space-y-8">
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-white"
                        >
                            Infrastructure that works quietly while you <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 drop-shadow-[0_0_20px_rgba(138,43,226,0.5)]">ship faster</span>.
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-lg sm:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed"
                        >
                            Ship applications faster with automated builds and global deployments.
                        </motion.p>
                    </div>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link to="/signup">
                        <Button size="lg" className="h-12 px-8 bg-white text-black hover:bg-zinc-200 font-semibold text-base rounded-full transition-all duration-300">
                        Start Building
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* Feature Section: Premium Bento Grid */}
            <div className="mt-16 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                
                {/* Block 1: Developer Experience (Large - col-span-2) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-900/40 backdrop-blur-md p-10 sm:p-14 group lg:col-span-2"
                >
                     <div className="relative z-20 max-w-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                            </div>
                            <div className="h-px bg-white/10 flex-1" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
                            Code with freedom. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Deploy with control.</span>
                        </h2>
                        <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
                             Push to git and let our automated build system handle the rest.
                             Instant rollbacks, preview deployments, and zero-downtime shipping.
                        </p>
                     </div>

                     {/* Abstract Code Visual */}
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[600px] h-[400px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none select-none hidden md:block">
                         <div className="font-mono text-sm space-y-2 text-violet-300">
                             <div className="flex"><span className="text-zinc-500 w-8">01</span> <span className="text-fuchsia-400">export</span> <span className="text-blue-400">default</span> <span className="text-yellow-300">function</span> <span className="text-blue-300">App</span>() {'{'}</div>
                             <div className="flex"><span className="text-zinc-500 w-8">02</span> &nbsp;&nbsp;<span className="text-fuchsia-400">return</span> (</div>
                             <div className="flex"><span className="text-zinc-500 w-8">03</span> &nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-green-400">ZYLO_Cloud</span></div>
                             <div className="flex"><span className="text-zinc-500 w-8">04</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">region</span>=<span className="text-orange-300">"global"</span></div>
                             <div className="flex"><span className="text-zinc-500 w-8">05</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">scale</span>=<span className="text-yellow-300">{'{'}true{'}'}</span></div>
                             <div className="flex"><span className="text-zinc-500 w-8">06</span> &nbsp;&nbsp;&nbsp;&nbsp;/&gt;</div>
                             <div className="flex"><span className="text-zinc-500 w-8">07</span> &nbsp;&nbsp;);</div>
                             <div className="flex"><span className="text-zinc-500 w-8">08</span> {'}'}</div>
                         </div>
                     </div>
                     
                     <div className="absolute -inset-px rounded-[2.5rem] ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-500" />
                     <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
                </motion.div>

                {/* Block 2: Global Edge (New - col-span-1) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black p-8 sm:p-10 flex flex-col justify-between group lg:col-span-1 min-h-[400px]"
                >
                     <div className="relative z-10 w-full mb-8">
                         {/* World Map Background (Abstract) */}
                         <div className="absolute inset-0 -top-10 opacity-30 select-none">
                             <svg viewBox="0 0 100 50" fill="none" className="w-full h-full text-white/20">
                                 <path d="M10 25 Q 30 5, 50 25 T 90 25" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                                 <path d="M5 35 Q 25 15, 55 35 T 95 30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                             </svg>
                             {/* Pulsing Dots */}
                             <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                             <div className="absolute top-1/3 left-2/3 w-2 h-2 bg-purple-500 rounded-full animate-ping delay-700" />
                             <div className="absolute top-2/3 left-1/2 w-2 h-2 bg-emerald-500 rounded-full animate-ping delay-300" />
                         </div>
                     </div>
                     
                     <div className="relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mb-6">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Global Edge</h3>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            Deploy to <span className="text-white">35+ regions</span> in seconds. Your app, everywhere, instantly.
                        </p>
                     </div>
                </motion.div>

                {/* Block 3: Instant Previews (New - col-span-1) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-900/40 backdrop-blur-md p-8 sm:p-10 flex flex-col group lg:col-span-1 min-h-[400px]"
                >
                     <div className="relative z-10 flex-1 flex items-center justify-center mb-8">
                         {/* Mock Browser Window */}
                         <div className="w-full aspect-[4/3] bg-black/50 rounded-lg border border-white/10 overflow-hidden relative shadow-2xl skew-y-3 group-hover:skew-y-0 transition-transform duration-500">
                             <div className="h-6 bg-white/5 border-b border-white/5 flex items-center px-3 gap-1.5">
                                 <div className="w-2 h-2 rounded-full bg-zinc-600" />
                                 <div className="w-2 h-2 rounded-full bg-zinc-600" />
                                 <div className="w-2 h-2 rounded-full bg-zinc-600" />
                             </div>
                             <div className="p-4 flex flex-col items-center justify-center h-full">
                                 <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-2 animate-bounce">
                                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                     </svg>
                                 </div>
                                 <div className="h-2 w-20 bg-zinc-800 rounded mb-1" />
                                 <div className="h-2 w-12 bg-zinc-800 rounded" />
                             </div>
                         </div>
                     </div>
                     
                     <div className="relative z-10 mt-auto">
                        <h3 className="text-2xl font-bold text-white mb-3">Instant Previews</h3>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            Every git shift creates a unique <span className="text-white">Preview URL</span> to share with your team.
                        </p>
                     </div>
                </motion.div>

                {/* Block 4: Scaling (Large - col-span-2) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black p-10 sm:p-14 flex flex-col items-center text-center group lg:col-span-2"
                >
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
                    
                    <div className="relative z-10">
                         <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-sm text-zinc-300 mb-8">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            99.99% Uptime
                         </div>
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium text-white mb-6">
                            Scale to <span className="font-serif italic text-zinc-500">infinity</span>
                        </h2>
                        <p className="text-zinc-400 max-w-lg mx-auto mb-8">
                            Whether you have 10 users or 10 million, your infrastructure scales automatically.
                        </p>
                    </div>
                    
                    {/* Abstract scaling visual */}
                    <div className="relative h-24 w-full max-w-md mx-auto flex items-end justify-center gap-1">
                        {[40, 60, 30, 80, 50, 90, 70, 45, 60, 80, 40, 60].map((h, i) => (
                            <motion.div 
                                key={i}
                                initial={{ height: "20%" }}
                                whileInView={{ height: `${h}%` }}
                                transition={{ duration: 1, delay: i * 0.05, ease: "backOut" }}
                                className="w-4 bg-zinc-800 rounded-t-sm group-hover:bg-violet-500/50 transition-colors duration-500" 
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Block 5: CTA Split (Full Width - col-span-3) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:col-span-3">
                    {/* Left CTA: Primary */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-900/40 p-10 sm:p-14 flex flex-col justify-center items-start group"
                    >
                        <h3 className="text-3xl font-bold text-white mb-4">
                            Ready to lift off?
                        </h3>
                        <p className="text-zinc-400 mb-8 max-w-xs">
                            Start building with a free account. No credit card required.
                        </p>
                        <Link to="/signup">
                            <Button className="h-12 px-8 bg-white text-black hover:bg-zinc-200 font-semibold text-base rounded-full shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)] transition-all">
                                Start for Free
                            </Button>
                        </Link>
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    </motion.div>

                    {/* Right CTA: Enterprise */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-black p-10 sm:p-14 flex flex-col justify-center items-start group"
                    >
                         <div className="absolute inset-0 bg-zinc-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h3 className="text-3xl font-bold text-white mb-4 relative z-10">
                            Enterprise
                        </h3>
                        <p className="text-zinc-500 mb-8 max-w-xs relative z-10">
                           Custom infrastructure, SLA guarantees, and dedicated support.
                        </p>
                        <Button variant="outline" className="h-12 px-8 border-white/10 text-white hover:bg-white/5 hover:text-white rounded-full relative z-10">
                            Talk to Sales
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
