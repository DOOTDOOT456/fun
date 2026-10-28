import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";

export function AuthPage() {
  const { isAuthenticated } = useConvexAuth();
  const { signIn } = useAuthActions();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGitHubSignIn() {
    setLoading(true);
    setError(null);
    try {
      await signIn("github", { redirectTo: "/game" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong with sign-in.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <div className="rounded-2xl border border-border/60 bg-card/60 p-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
            🎮
          </span>
          <h1 className="mt-5 text-2xl font-bold">You're signed in</h1>
          <p className="mt-2 text-muted-foreground">
            Head to the board to start capturing tiles.
          </p>
          <Link
            to="/game"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:brightness-110"
          >
            Open the game
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolation-isolate">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[40vh] w-3/4 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-md px-6 py-20 sm:py-28">
        <div className="text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-primary">
            Tilescape
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Join the map
          </h1>
          <p className="mt-3 text-muted-foreground">
            Sign in with GitHub to claim a team color and start playing.
          </p>
        </div>

        {/* Sign-in card */}
        <div className="mt-10 rounded-2xl border border-border/70 bg-card/40 p-6 sm:p-8">
          {error && (
            <div className="mb-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGitHubSignIn}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-secondary-foreground/30 border-t-secondary-foreground animate-spin" />
                Redirecting to GitHub…
              </>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.604-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0Z" />
                </svg>
                Continue with GitHub
              </>
            )}
          </button>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            By signing in you agree to the game's data policies. We only store
            your GitHub username, avatar, and the tiles you capture.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-5 text-sm text-muted-foreground">
          <p className="font-medium text-foreground/80">Setup quick-start</p>
          <ul className="mt-2 space-y-1.5 list-inside list-disc">
            <li>Install deps with <code className="text-foreground">bun install</code></li>
            <li>Start with <code className="text-foreground">bun run dev</code></li>
            <li>Sign in via GitHub (Convex Auth), then set the OAuth keys in Settings → Environment</li>
          </ul>
          <p className="mt-2 text-xs text-muted-foreground/70">
            Full details in the <a className="font-medium text-primary underline-offset-2 hover:underline" href="#readme">README</a>.
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already signed in?{" "}
          <Link
            to="/game"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Go to the game
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
