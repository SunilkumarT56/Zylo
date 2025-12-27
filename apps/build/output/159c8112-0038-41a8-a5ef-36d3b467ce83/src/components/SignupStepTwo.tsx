import { Github } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/Logo";
import { useSearchParams } from "react-router-dom";

export function SignupStepTwo() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4 font-sans">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-2 text-center">
           <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
            <Logo className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome!
          </h1>
          <p className="text-sm text-zinc-400">
            {email ? `Signing up with ${email}` : "Choose how you want to sign up"}
          </p>
        </div>

        <div className="grid gap-4">
             {/* Google Login Placeholder */}
             <Button variant="outline" className="w-full border-white/10 bg-black text-white hover:bg-white/5 hover:text-white h-10 justify-start px-4">
                <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24">
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
                variant="outline" 
                className="w-full border-white/10 bg-black text-white hover:bg-white/5 hover:text-white h-10 justify-start px-4"
                onClick={() => window.location.href = "https://untolerative-len-rumblingly.ngrok-free.dev/auth/github"}
            >
                <Github className="mr-3 h-4 w-4" />
                Continue with GitHub
            </Button>
        </div>
      </div>
    </div>
  );
}
