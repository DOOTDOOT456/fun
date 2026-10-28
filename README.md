# Tilescape 🎮 — 5v5 multiplayer FPS on Convex + GitHub

A live, real-time multiplayer territory/first-person shooter built to learn
how to wire **GitHub OAuth**, **Convex** (database, real-time queries/mutations,
subscriptions), and **Vite + React** together — then deploy it to **GitHub Pages**.

## Tech stack

| Layer | Technology | Why |
| --- | --- | --- |
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS v4 | Fast, type-safe UI with the existing template's styling tokens |
| 3D renderer | Three.js, `@react-three/fiber`, `@react-three/drei`, `oimo` | Canvas-based first-person view, physics, post-processing, and mesh ref syncing |
| Backend | Convex 1.48 (database, real-time queries, mutations) | Reactivity, auth, and the "live board" between players |
| Auth | Convex Dev Auth (`@convex-dev/auth`) with GitHub OAuth | No custom auth plumbing; OAuth via GitHub |
| Hosting | GitHub Pages (static `dist/` output) | Free static hosting for the Vite build |

## Quick start (run locally)

```bash
# 1. Install dependencies
bun install

# 2. Start the Vite dev server (takes the port from the managed preview)
bun run dev
```

Open http://localhost:3000. Sign in with GitHub, pick a team color, and drag
across the 20×20 grid / 5v5 arena to capture tiles. The board, player roster,
and chat all update reactively as other players act.

## How the multiplayer actually works

- **`src/convex/game.ts`** — Convex mutations and queries:
  - `spawn` / `position` — create/update a player's live row (position, health,
    ammo, kills, team, lastSeen).
  - `hit` — reduce an enemy player's health when you shoot them.
  - `players` / `board` / `chat` — reactive subscriptions.
- **`src/game/engine.tsx`** — a `react-three-fiber` `Canvas` rooted in `GameScene`.
  A `CameraRig` follows the local player, or the two team centroids when you walk
  away. Every Convex player row drives a three.js mesh via `useFrame`.
- **State sync** — local changes are written optimistically into an in-memory
  store (`src/game/sync.tsx`), confirmed by Convex mutations, and broadcast to
  all connected clients through Convex's reactive query subscriptions.

## Configure auth (GitHub) and Convex

1. **Convex project & deployment** — run `bun convex dev` (or use the Freebuff
   deploy flow). This creates `convex.json` and connects the backend.

2. **Create a GitHub OAuth app** on GitHub → Settings → Developer settings →
   OAuth Apps:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/auth`
   Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.

3. **Add them to the project** — in **Settings → Environment** (sandbox) or via
   the platform's env UI:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `VITE_CONVEX_URL` (your Convex deployment URL)
   - `SITE_URL` (for OAuth redirects)

4. **Restart the dev server** so it picks up the new env.

That's it — `ConvexAuthProvider` in `src/main.tsx` wires everything up, and the
auth page lets anyone sign in with GitHub.

## Deploy to GitHub Pages

1. Build the static output:

   ```bash
   bun run build
   # → dist/index.html + dist/assets/*
   ```

2. Host `dist/` on GitHub Pages (set the base path to `/<repo-name>/`
   if your repo isn't at the domain root).

3. **Production environment vars** (separate from sandbox `.env`):

   ```bash
   freebuff-deploy env list          # which keys exist
   freebuff-deploy env set '{"GITHUB_CLIENT_ID":"...","GITHUB_CLIENT_SECRET":"...","VITE_CONVEX_URL":"https://...convex.cloud","SITE_URL":"https://<user>.github.io/<repo>/"}' --restart
   ```

## Project layout

```
src/
  main.tsx                 # React root + Convex + Convex Auth providers
  App.tsx                  # Router: / -> /auth -> /game
  index.css                # Tailwind v4 base + custom theme tokens
  convex/
    schema.ts              # Convex tables: users, game_players, game_board, game_chat
    auth.ts                # Convex Dev Auth with GitHub provider
    game.ts                # spawn/position/hit/players/board/chat queries + mutations
    users.ts               # me, ensureUser, setTeam, updateUserGitHub
  game/                    # 3D layer
    engine.tsx             # Canvas, CameraRig, GameScene
    playerMesh.tsx         # PlayerBody, HealthShade (mesh refs synced each frame)
    HUD.tsx                # health/ammo/kills/team on-screen panel
    sync.tsx               # in-memory game-state store
    types.ts               # PlayerState, Team
  pages/                   # Landing, auth, and the 5v5 game page
```

## Notes / gotchas

- The local Convex backend binary (`convex dev --once`) won't run in some
  sandboxed environments because its precompiled binary needs `GLIBC_2.38+`;
  the types are hand-authored in `src/convex/_generated/` and compile fine.
- Tailwind v4 requires `@tailwindcss/postcss` (already installed) — the
  PostCSS config processes `@tailwind` directives.
- `noUnusedLocals` is on, so every import must be used. The pre-existing
  `convex.dev` cannot verify locally; the typecheck below is the correct check.

## Checks

```bash
# Types (frontend + Convex)
bun tsc -b --noEmit

# Production build
bun run build
```
