import { Authenticated } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { GamePage } from "./pages/GamePage";
import { Header } from "./components/Header";

export function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading Tilescape…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/game" replace state={{ from: location }} />
              ) : (
                <LandingPage />
              )
            }
          />
          <Route
            path="/auth"
            element={
              isAuthenticated ? (
                <Navigate to="/game" replace state={{ from: location }} />
              ) : (
                <AuthPage />
              )
            }
          />
          <Route
            path="/game"
            element={
              isAuthenticated ? (
                <Authenticated>
                  <GamePage />
                </Authenticated>
              ) : (
                <Navigate to="/auth" replace state={{ from: location }} />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Tilescape — a live multiplayer territory game. Built with Convex and React.
      </footer>
    </div>
  );
}
