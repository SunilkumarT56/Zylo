import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Dashboard } from "@/components/Dashboard";
import { AuthPage } from "@/components/AuthPage";
import { VerifyPage } from "@/components/VerifyPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

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
      } else {
         // 2. Check session endpoint
         try {
             // Try port 3000 first as per AuthPage.tsx
             const response = await fetch("http://localhost:3000/auth/me", {
                 credentials: "include"
             });
             if (response.ok) {
                 const data = await response.json();
                 if (data.user || data.authenticated) { // Adjust based on actual response
                     localStorage.setItem("isAuthenticated", "true");
                     setIsAuthenticated(true);
                 }
             }
         } catch (e) {
             console.log("Session check failed", e);
         }
      }
    };
    
    // Run once on mount
    if (!isAuthenticated) {
        checkAuth();
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
  };

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={
          !isAuthenticated ? (
            <AuthPage onLogin={handleLogin} />
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
              <Header onLogout={handleLogout} />
              <main>
                <Dashboard />
              </main>
            </div>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route 
        path="/new" 
        element={
          isAuthenticated ? (
            <div className="min-h-screen bg-black text-white selection:bg-white/20 selection:text-white font-sans antialiased">
              <Header onLogout={handleLogout} />
              <main>
                <Hero />
              </main>
            </div>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
    </Routes>
  );
}

export default App;
