import { useState } from "react";
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
            <Navigate to="/" replace />
          )
        } 
      />
      <Route 
        path="/verify" 
        element={<VerifyPage />} 
      />
      <Route 
        path="/" 
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
