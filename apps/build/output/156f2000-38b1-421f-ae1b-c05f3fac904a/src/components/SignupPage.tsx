import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";

interface SignupPageProps {
  onLogin?: (user?: any) => void;
}

export function SignupPage({ onLogin }: SignupPageProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://untolerative-len-rumblingly.ngrok-free.dev/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process email");
      }

      const data = await response.json();

      if (data.authenticated && data.user) {
         localStorage.setItem("isAuthenticated", "true");
         if (data.token) {
             localStorage.setItem("authToken", data.token);
         }

         if (onLogin) {
             onLogin(data.user);
         }
         window.location.href = "/dashboard";
         return;
      }

      if (data.redirectTo) {
        window.location.href = data.redirectTo;
        return;
      }

      navigate(`/signup/connect?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4 font-sans relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0">
             <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full mix-blend-screen opacity-50 animate-pulse-slow" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 blur-[100px] rounded-full mix-blend-screen opacity-30" />
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_100%,transparent_100%)]"></div>
        </div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md relative z-10"
        >
            <div className="glass-panel p-8 sm:p-10 rounded-2xl shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
                <div className="flex flex-col items-center gap-4 text-center mb-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-inner">
                        <Logo className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                            Create an account
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            Enter your email below to create your account
                        </p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <div className="grid gap-3">
                         <Button variant="outline" type="button" disabled={isLoading} className="w-full relative h-11 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white transition-all overflow-hidden group">
                             <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                            </svg>
                            <span className="relative z-10">Sign up with Google</span>
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            disabled={isLoading}
                            className="w-full relative h-11 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white transition-all overflow-hidden group"
                            onClick={() => window.location.href = "https://untolerative-len-rumblingly.ngrok-free.dev/auth/github"}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Github className="mr-2 h-5 w-5" />
                            <span className="relative z-10">Sign up with GitHub</span>
                        </Button>
                    </div>

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black/50 backdrop-blur-sm px-2 text-zinc-500 rounded-full border border-white/5">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="h-11 bg-black/50 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all rounded-lg"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            />
                        </div>

                        {error && <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-sm text-red-400 text-center bg-red-500/10 py-2 rounded-md border border-red-500/20">{error}</motion.p>}

                        <Button
                            disabled={isLoading}
                            className="h-11 bg-white text-black hover:bg-zinc-200 font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? "Processing..." : "Sign Up with Email"}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-zinc-500">
                        <Link to="/login" className="hover:text-white transition-colors underline underline-offset-4 decoration-zinc-700 hover:decoration-white">
                            Already have an account? Log In
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    </div>
  );
}
