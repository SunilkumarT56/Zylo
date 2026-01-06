import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Dashboard } from '@/components/Dashboard';
import { AuthPage } from '@/components/AuthPage';
import { VerifyPage } from '@/components/VerifyPage';
import { LandingPage } from '@/components/LandingPage';
import { SignupPage } from '@/components/SignupPage';
import { SignupStepTwo } from '@/components/SignupStepTwo';
import { Footer } from '@/components/Footer';
import { DeploymentProgress } from '@/components/DeploymentProgress';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { YtPipelineDashboard } from '@/components/YtPipelineDashboard';
import { PipelineDetailsPage } from '@/components/PipelineDetailsPage';
import { ThemeProvider } from '@/components/ThemeProvider';

interface UserData {
  id: string;
  email: string;
  avatar_url?: string;
  avatarUrl?: string;
  avatar?: string;
  github_name?: string;
  name?: string;
  username?: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking auth...');
      // 1. Check for token in URL (OAuth callback)
      const params = new URLSearchParams(window.location.search);
      let token = params.get('token');

      if (token) {
        console.log('Token found in URL');
        localStorage.setItem('authToken', token);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        token = localStorage.getItem('authToken');
        console.log('Token from localStorage:', token ? 'Found' : 'Not found');
      }

      // Fallback to hardcoded token if no dynamic token found (Preserving user's testing token)
      if (!token) {
        console.log('Using fallback hardcoded token');
        token =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3Njc2NDAzODYsImV4cCI6MTc3NjE5Mzk4Nn0.8aandcUrp7hKDP8Ryw5xlP51Z0EZYKZyec8xM43lZUU';
      }

      if (token) {
        try {
          console.log('Fetching /user/me with token...');
          const response = await fetch(
            'https://untolerative-len-rumblingly.ngrok-free.dev/user/me',
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
              },
            },
          );

          if (response.ok) {
            const data = await response.json();
            console.log('Auth Data:', data);

            // Robustly attempt to find user data in common patterns
            let userData = null;
            if (data.user && data.user.email) {
              userData = data.user;
            } else if (data.data && data.data.email) {
              userData = data.data;
            } else if (data.email) {
              userData = data;
            } else if (data.user) {
              // Fallback for user object without email at top level (maybe deep nested?)
              userData = data.user;
            }

            if (data.authenticated === true || userData) {
              setIsAuthenticated(true);
              localStorage.setItem('isAuthenticated', 'true');

              if (userData) {
                setUserId(userData.id);
                setUserEmail(userData.email);
                // Handle both camelCase and snake_case for avatar
                setUserAvatarUrl(userData.avatar_url || userData.avatarUrl || userData.avatar);

                // Handle User Name
                setUserName(userData.github_name || userData.name || userData.username || null);

                console.log('User data set:', userData.email);
              }
            } else {
              console.log('Authenticated but no user data found in expected formats:', data);
              // Even if no specific user data, if response was OK and we had a token, strictly speaking we might be auth'd?
              // But user specifically said "once u get isauthenticated as true"
              if (data.authenticated === true) {
                setIsAuthenticated(true);
                localStorage.setItem('isAuthenticated', 'true');
              }
            }
          } else {
            console.log('Response not OK, logging out');
            handleLogout();
          }
        } catch (e) {
          console.log('Session check failed', e);
          setIsAuthenticated(false);
        } finally {
          console.log('Auth checking done');
          setIsAuthChecking(false);
        }
      } else {
        console.log('No token, marking check as done');
        setIsAuthChecking(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData?: UserData) => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
    if (userData) {
      setUserId(userData.id);
      setUserEmail(userData.email);
      setUserAvatarUrl(userData.avatar_url || userData.avatarUrl || userData.avatar || null);
      setUserName(userData.github_name || userData.name || userData.username || null);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(
        'https://untolerative-len-rumblingly.ngrok-free.dev/auth/logout',
        {
          method: 'POST',
          credentials: 'include',
        },
      );
      if (response.ok) {
        const data = await response.json();
        if (data.redirectTo) {
          window.location.href = data.redirectTo;
          return;
        }
      }
    } catch (error) {
      console.error('Logout request failed', error);
    } finally {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('logged_in');
      setIsAuthenticated(false);
      setUserEmail(null);
    }
  };

  // Define paths where footer should not be visible
  const hideFooterPaths = [
    '/login',
    '/signup',
    '/signup/connect',
    '/verify',
    '/yt-pipeline-dashboard',
  ];
  const shouldShowFooter = !hideFooterPaths.includes(location.pathname);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground relative transition-colors duration-300">
        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <AuthPage onLogin={(u) => handleLogin(u as UserData)} />
              ) : (
                <Navigate to="/yt-pipeline-dashboard" replace />
              )
            }
          />
          <Route
            path="/signup"
            element={
              !isAuthenticated ? (
                <SignupPage onLogin={(u) => handleLogin(u as UserData)} />
              ) : (
                <Navigate to="/yt-pipeline-dashboard" replace />
              )
            }
          />
          <Route
            path="/signup/connect"
            element={
              !isAuthenticated ? (
                <SignupStepTwo />
              ) : (
                <Navigate to="/yt-pipeline-dashboard" replace />
              )
            }
          />
          <Route path="/verify" element={<VerifyPage />} />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <div className="min-h-screen text-foreground selection:bg-primary/20 selection:text-primary font-sans antialiased bg-transparent">
                  <Header
                    onLogout={handleLogout}
                    userEmail={userEmail}
                    userId={userId}
                    userAvatarUrl={userAvatarUrl}
                    userName={userName}
                  />
                  <main>
                    <ErrorBoundary>
                      <Dashboard />
                    </ErrorBoundary>
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
              isAuthenticated ? <Navigate to="/yt-pipeline-dashboard" replace /> : <LandingPage />
            }
          />
          <Route
            path="/new"
            element={
              isAuthenticated ? (
                <div className="min-h-screen text-foreground selection:bg-primary/20 selection:text-primary font-sans antialiased bg-transparent">
                  <Header
                    onLogout={handleLogout}
                    userEmail={userEmail}
                    userId={userId}
                    userAvatarUrl={userAvatarUrl}
                    userName={userName}
                  />
                  <main>
                    <Hero />
                  </main>
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/deploying"
            element={isAuthenticated ? <DeploymentProgress /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/yt-pipeline-dashboard"
            element={isAuthenticated ? <YtPipelineDashboard /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/pipeline/:name"
            element={isAuthenticated ? <PipelineDetailsPage /> : <Navigate to="/login" replace />}
          />
        </Routes>
        {shouldShowFooter && <Footer />}
      </div>
    </ThemeProvider>
  );
}

export default App;
