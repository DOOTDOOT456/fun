import { useSync } from "./sync";

export function HUD() {
  const { state, activePlayerId } = useSync();

  // Local player view.
  const local = state.find((p) => p.id === activePlayerId);
  const opponents = state.filter((p) => p.id !== activePlayerId);

  if (!local) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-start justify-between p-4">
      {/* Heart bar */}
      <div className="mb-6 flex items-center gap-2 text-white">
        <span className="font-mono text-sm tabular-nums">{local.name}</span>
        <div className="flex-1 h-3 overflow-hidden rounded-full bg-black/40">
          <div
            className="h-full rounded-full transition-[width] duration-120"
            style={{ width: `${local.health}%`, backgroundColor: local.health > 50 ? "#22d3ee" : local.health > 25 ? "#fbbf24" : "#ef4444" }}
          />
        </div>
        <span className="font-mono text-sm tabular-nums">{Math.ceil(local.health)}</span>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-4 gap-3 text-sm">
        <Stat label="Team" value={local.team} />
        <Stat label="Ammo" value={local.ammo} />
        <Stat label="Kills" value={local.killed} />
        <Stat label="Score" value={local.killed} />
      </div>

      {/* Kill feed */}
      <div className="max-h-32 overflow-y-auto rounded-lg bg-black/40 p-3 text-xs text-white/90">
        <div className="mb-2 font-semibold uppercase tracking-wider text-white/60">Kill feed</div>
        {opponents.map((p) => (
          <div key={p.id} className="truncate text-white/80">
            <span className="mr-1">vs {p.name}</span>
            <span className="font-mono">{p.killed}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-white/50">{label}</div>
      <div className="font-mono text-sm tabular-nums">{value}</div>
    </div>
  );
}
