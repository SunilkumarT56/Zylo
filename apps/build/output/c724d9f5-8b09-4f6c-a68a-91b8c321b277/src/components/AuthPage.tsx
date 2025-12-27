import { useState } from "react";
import { Github, Triangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/Logo";
import { Link, useNavigate } from "react-router-dom";

interface AuthPageProps {
  onLogin: (user?: any) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("https://untolerative-len-rumblingly.ngrok-free.dev/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        // If 404/method not allowed, maybe fallback to verify path? 
        // But for now let's assume the endpoint exists as implied.
        // Or throw generic error.
        throw new Error("Login failed");
      }

      const data = await response.json();
      console.log("Login response:", data);

      if (data.authenticated && data.user) {
         localStorage.setItem("isAuthenticated", "true");
         if (data.token) {
             localStorage.setItem("authToken", data.token);
         }
         
         // Assuming 'onLogin' is available (I will fix signature next).
         onLogin(data.user); 
         window.location.href = "/dashboard";
         return;
      }

      if (data.redirectTo) {
        window.location.href = data.redirectTo;
        return;
      }

      // Fallback
      navigate(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4 font-sans">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
            <Logo className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Log in to Zylo
          </h1>
          <p className="text-sm text-zinc-400">
            Build and deploy web apps with Zylo
          </p>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-2">
             {/* Google Login Placeholder - Functionality pending backend */}
             <Button variant="outline" type="button" disabled={isLoading} className="w-full border-white/10 bg-black text-white hover:bg-white/5 hover:text-white h-10">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
                Continue with Google
            </Button>
            <Button 
                variant="outline"    // https://untolerative-len-rumblingly.ngrok-free.dev
                type="button" 
                disabled={isLoading} 
                className="w-full border-white/10 bg-black text-white hover:bg-white/5 hover:text-white h-10"
                onClick={() => window.location.href = "https://untolerative-len-rumblingly.ngrok-free.dev/auth/github"}
            > 
                <Github className="mr-2 h-4 w-4" />
                Continue with GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-zinc-400">
                Or
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  className="bg-black border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-white/20 h-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                  <Triangle className="h-4 w-4 rotate-180 fill-red-500" />
                  <p>{error}</p>
                </div>
              )}

              <Button 
                disabled={isLoading} 
                className="bg-white text-black hover:bg-zinc-200 h-10 font-medium"
              >
                {isLoading ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : null}
                Continue with Email
              </Button>
            </div>
          </form>

          <div className="text-center text-sm text-zinc-400">
             <Link to="/signup" className="underline hover:text-white underline-offset-4">
                Don't have an account? Sign Up
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
