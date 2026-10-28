import { Link, useLocation } from "react-router-dom";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";

export function Header() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const location = useLocation();

  const pathname = location.pathname;

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-lg font-semibold tracking-tight"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
            T
          </span>
          <span className="hidden sm:inline">Tilescape</span>
        </Link>

        <nav className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
          ) : isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Playing
              </span>
              <Link
                to="/game"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/game"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Game
              </Link>
              <button
                type="button"
                onClick={() => signOut()}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:brightness-110"
            >
              Join the game
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
