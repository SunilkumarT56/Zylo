import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Triangle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("http://localhost:3000/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage("Email verified successfully!");
          
          // Set isAuthenticated in localStorage since the backend sets the cookie
          localStorage.setItem("isAuthenticated", "true");

          // Redirect to home after a delay
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("An error occurred during verification.");
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
            {status === "verifying" && <Triangle className="h-6 w-6 fill-white text-white animate-pulse" />}
            {status === "success" && <CheckCircle2 className="h-6 w-6 text-green-500" />}
            {status === "error" && <XCircle className="h-6 w-6 text-red-500" />}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {status === "verifying" && "Verifying..."}
            {status === "success" && "Verified!"}
            {status === "error" && "Verification Failed"}
          </h1>
          <p className="text-sm text-zinc-400">
            {message}
          </p>
        </div>

        {status === "error" && (
          <div className="grid gap-4">
            <Button 
              className="bg-white text-black hover:bg-zinc-200"
              onClick={() => navigate("/auth")}
            >
              Back to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
