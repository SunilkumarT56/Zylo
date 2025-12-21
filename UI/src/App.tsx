import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Dashboard } from "@/components/Dashboard";
import { AuthPage } from "@/components/AuthPage";
import { VerifyPage } from "@/components/VerifyPage";
import { LandingPage } from "@/components/LandingPage";
import { SignupPage } from "@/components/SignupPage";
import { SignupStepTwo } from "@/components/SignupStepTwo";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check for token in URL (OAuth callback)
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (token) {
        localStorage.setItem("isAuthenticated", "true");
        setIsAuthenticated(true);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsAuthChecking(false);
      } else {
             // 2. Check session endpoint
         try {
             // Use the correct backend URL
             const response = await fetch("https://untolerative-len-rumblingly.ngrok-free.dev/user/me", {
                 credentials: "include"
             });
             if (response.ok) {
                 const data = await response.json();
                 if (data.authenticated) {
                     localStorage.setItem("isAuthenticated", "true");
                     setIsAuthenticated(true);
                     if (data.user && data.user.email) {
                        setUserEmail(data.user.email);
                     }
                 }
             }
         } catch (e) {
             console.log("Session check failed", e);
         } finally {
            setIsAuthChecking(false);
         }
      }
    };
    
    checkAuth();
  }, []);

  const handleLogin = () => {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("https://untolerative-len-rumblingly.ngrok-free.dev/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.redirectTo) {
          window.location.href = data.redirectTo;
          return;
        }
      }
    } catch (error) {
      console.error("Logout request failed", error);
    } finally {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("logged_in");
      setIsAuthenticated(false);
      setUserEmail(null);
    }
  };

  if (isAuthChecking) {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center text-white">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
      );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          !isAuthenticated ? (
            <AuthPage onLogin={handleLogin} />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } 
      />
      <Route 
        path="/signup" 
        element={
          !isAuthenticated ? (
            <SignupPage />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } 
      />
      <Route 
        path="/signup/connect" 
        element={
          !isAuthenticated ? (
            <SignupStepTwo />
          ) : (
             <Navigate to="/dashboard" replace />
          )
        } 
      />
      <Route 
        path="/verify" 
        element={<VerifyPage />} 
      />
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated ? (
            <div className="min-h-screen bg-black text-white selection:bg-white/20 selection:text-white font-sans antialiased">
              <Header onLogout={handleLogout} userEmail={userEmail} />
              <main>
                <Dashboard />
              </main>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LandingPage />
          )
        } 
      />
      <Route 
        path="/new" 
        element={
          isAuthenticated ? (
            <div className="min-h-screen bg-black text-white selection:bg-white/20 selection:text-white font-sans antialiased">
              <Header onLogout={handleLogout} userEmail={userEmail} />
              <main>
                <Hero />
              </main>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  );
}

export default App;
