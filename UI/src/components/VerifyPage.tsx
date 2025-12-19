import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/Logo";

export function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) {
      // If no email, maybe redirect back to login?
      // navigate("/login");
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
        setError("Please enter a valid 6-digit code");
        return;
    }
    setError("");
    setIsLoading(true);

    try {
        // Simulate API verification
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Success
        localStorage.setItem("isAuthenticated", "true");
        navigate("/dashboard");

    } catch (err) {
      setError("Invalid code. Please try again.");
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
            Check your inbox
          </h1>
          <p className="text-sm text-zinc-400">
            We've sent a 6-digit code to <span className="text-white">{email}</span>. 
            Enter it below to verify your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Input
              id="code"
              placeholder="000000"
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              className="bg-black border-white/10 text-center text-2xl tracking-[0.5em] text-white placeholder:text-zinc-600 focus-visible:ring-white/20 h-14"
              value={code}
              onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                  setCode(val);
              }}
              required
              maxLength={6}
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-500 text-center">
              {error}
            </div>
          )}

          <Button 
            disabled={isLoading || code.length !== 6} 
            className="bg-white text-black hover:bg-zinc-200 h-10 font-medium"
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </Button>
        </form>

        <div className="text-center text-sm text-zinc-400">
           <button onClick={() => navigate("/login")} className="hover:text-white transition-colors">
              Wrong email? Log in again
           </button>
        </div>
      </div>
    </div>
  );
}
