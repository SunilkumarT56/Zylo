import { useState } from "react";
import { Github, Lock, Triangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/Logo";

interface AuthPageProps {
  onLogin: () => void;
}

type AuthView = "LOGIN" | "SIGNUP" | "VERIFY";

export function AuthPage({ onLogin }: AuthPageProps) {
  const [view, setView] = useState<AuthView>("LOGIN");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (view === "SIGNUP") {
        const response = await fetch("http://localhost:3000/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setView("VERIFY");
        } else {
          setError(data.message || "Signup failed");
        }
      } else if (view === "VERIFY") {
        const response = await fetch("http://localhost:3000/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: otp }), // Backend expects 'token'
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Success!
          // Store auth state
          localStorage.setItem("isAuthenticated", "true");
          // Redirect/Update state
          onLogin();
        } else {
          setError(data.message || "Verification failed");
        }
      } else if (view === "LOGIN") {
        const response = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
           // Success!
           // Store auth state
           localStorage.setItem("isAuthenticated", "true");
           onLogin();
        } else {
           setError(data.message || "Login failed");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (view) {
      case "LOGIN": return "Welcome back";
      case "SIGNUP": return "Create an account";
      case "VERIFY": return "Check your email";
    }
  };

  const getDescription = () => {
    switch (view) {
      case "LOGIN": return "Enter your credentials to access your account";
      case "SIGNUP": return "Enter your details below to create your account";
      case "VERIFY": return "Enter the verification code sent to your email";
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
            {view === "VERIFY" ? (
              <Lock className="h-6 w-6 text-white" />
            ) : (
              <Logo className="h-6 w-6 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {getTitle()}
          </h1>
          <p className="text-sm text-zinc-400">
            {getDescription()}
          </p>
        </div>

        <div className="grid gap-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              {view === "VERIFY" ? (
                <div className="grid gap-2">
                   <Input
                    id="otp"
                    placeholder="Enter verification code/token"
                    type="text"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={isLoading}
                    className="bg-black border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-white/20 text-center"
                    required
                  />
                </div>
              ) : (
                <>
                  {view === "SIGNUP" && (
                    <div className="grid gap-2">
                       <Input
                        id="name"
                        placeholder="Name"
                        type="text"
                        autoCapitalize="words"
                        autoComplete="name"
                        autoCorrect="off"
                        disabled={isLoading}
                        className="bg-black border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-white/20"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                      className="bg-black border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-white/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Input
                      id="password"
                      placeholder="Password"
                      type="password"
                      autoComplete={view === "LOGIN" ? "current-password" : "new-password"}
                      disabled={isLoading}
                      className="bg-black border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-white/20"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                  <Triangle className="h-4 w-4 rotate-180 fill-red-500" />
                  <p>{error}</p>
                </div>
              )}

              <Button 
                disabled={isLoading} 
                className="bg-white text-black hover:bg-zinc-200"
              >
                {isLoading ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : null}
                {view === "LOGIN" && "Sign In"}
                {view === "SIGNUP" && "Sign Up"}
                {view === "VERIFY" && "Verify Email"} 
              </Button>
            </div>
          </form>

          {view !== "VERIFY" && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-2 text-zinc-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="relative">
                <Button variant="outline" type="button" disabled={isLoading} className="w-full border-white/10 bg-black text-white hover:bg-white/5 hover:text-white">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
                <div className="absolute left-[110%] top-1/2 -translate-y-1/2 flex items-center gap-2 w-max hidden sm:flex">
                  <svg
                    width="60"
                    height="35"
                    viewBox="0 0 60 35"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-zinc-600 -translate-y-2"
                  >
                    <path
                      d="M58 1C58 1 15 1 8 13C1 25 1 33 1 33M1 33L6 26M1 33L-4 26"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-xs text-zinc-500 max-w-[120px] leading-tight translate-y-2">
                    If you want webhook flow, login via GitHub
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="text-center text-sm text-zinc-400">
            {view === "VERIFY" ? (
              <button
                onClick={() => setView("SIGNUP")}
                className="underline hover:text-white underline-offset-4"
              >
                Back to Sign Up
              </button>
            ) : (
              <button
                onClick={() => setView(view === "LOGIN" ? "SIGNUP" : "LOGIN")}
                className="underline hover:text-white underline-offset-4"
              >
                {view === "LOGIN"
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Sign In"}
              </button>
            )}
          </div>
        </div>

        <p className="px-8 text-center text-sm text-zinc-500">
          By clicking continue, you agree to our{" "}
          <a href="#" className="underline hover:text-white underline-offset-4">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-white underline-offset-4">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
