import { Link } from "react-router-dom";
import { useConvexAuth } from "@convex-dev/auth/react";

export function LandingPage() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <div className="relative isolation-isolate">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-1/4 h-[50vh] w-1/2 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-[60vh] w-1/3 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        {/* Eyebrow */}
        <div className="mb-6 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
          <span className="h-px w-6 bg-primary/40" />
          Live multiplayer
          <span className="h-px w-6 bg-primary/40" />
        </div>

        {/* Headline */}
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-balance sm:text-6xl md:text-7xl">
            Color the map. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Be the majority.
          </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground text-balance">
            Tilescape is a real-time territory game. Sign in, pick a color, and
            capture adjacent tiles. Everyone else sees the board move — and your
            color — as it happens.
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
          <Link
            to={isAuthenticated ? "/game" : "/auth"}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-glow-ring transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {isAuthenticated ? "Open the board" : "Start playing"}
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
          <p className="text-sm text-muted-foreground">
            Uses your GitHub account via Convex Auth. No account password to
            manage.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            title="Real-time board"
            description="Every tile capture hits Convex and is visible to every other player the next frame. No polling, no refresh."
          />
          <Feature
            title="Territory scoring"
            description="Each player owns tiles of their color. The scoreboard sorts itself as the map fills in."
          />
          <Feature
            title="Local-first feel"
            description="Play with a mouse or trackpad. Pick a team color first, then drag across the grid to claim territory."
          />
        </div>

        {/* Setup guide */}
        <div className="mt-20 border-t border-border/60 pt-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 1 1 8 0v4M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Setup guide</h2>
            </div>
            <p className="text-muted-foreground">
              This repo wires together GitHub OAuth, Convex (database + realtime),
              a 3D FPS, and GitHub Pages hosting. Follow the steps below to run it
              locally, then deploy it.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {[
                "1. Install dependencies — <code>bun install</code>",
                "2. Start Vite — <code>bun run dev</code> (port from the preview)",
                "3. Sign in with GitHub via Convex Auth",
                "4. Configure the GitHub OAuth App and <code>VITE_CONVEX_URL</code>",
                "5. Deploy to GitHub Pages with <code>bun run build</code>",
              ].map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground/70">
              Full details (auth setup, env vars, the multiplayer data model, and
              the 3D render loop) are in <a className="font-medium text-primary underline-offset-2 hover:underline" href="#readme">README.md</a>.
            </p>
          </div>
        </div>

        {/* Stack line */}
        <div className="mt-20 border-t border-border/60 pt-10 text-center text-sm text-muted-foreground">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Built with
          </span>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <StackChip name="Convex" hint="realtime backend + DB" />
            <StackChip name="React + Vite" hint="frontend" />
            <StackChip name="Convex Auth" hint="GitHub sign-in" />
            <StackChip name="GitHub Pages" hint="hosted deploy" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-border/60 p-6 transition-all hover:border-primary/40 hover:shadow-md">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function StackChip({ name, hint }: { name: string; hint: string }) {
  return (
    <span>
      <span className="font-medium text-foreground">{name}</span>
      <span className="ml-1.5 text-xs text-muted-foreground/70">· {hint}</span>
    </span>
  );
}
