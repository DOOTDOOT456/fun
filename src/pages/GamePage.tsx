import { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "react-three-fiber";
import * as THREE from "three";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { GameScene } from "../game/engine";
import { HUD } from "../game/HUD";
import { useSync } from "../game/sync";
import { PlayerState } from "../game/types";

const raycaster = new THREE.Raycaster();

export function GamePage() {
  const me = useQuery(api.users.me);
  const playersQuery = useQuery(api.game.players);

  const spawn = useMutation(api.game.spawn);
  const hit = useMutation(api.game.hit);

  const [playerState, setPlayerState] = useState<PlayerState[]>([]);
  const { state, pushAction } = useSync();

  const { camera } = useThree();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [local, setLocal] = useState<PlayerState | null>(null);

  // Build the local player from Convex + the in-memory game state.
  useEffect(() => {
    if (!me) return;
    const found = state.find((p) => p.id === me._id);
    setLocal(found ?? null);
  }, [me, state]);

  // Respond to Convex player list changes.
  useEffect(() => {
    if (!playersQuery) return;
    const map = new Map<string, PlayerState>();
    for (const p of playersQuery) {
      if (!p.userId) continue;
      map.set(p.userId, {
        id: p.userId,
        name: p.name ?? "Player",
        avatarUrl: p.avatarUrl ?? "",
        team: (p.team as PlayerState["team"]) ?? "cyan",
        x: p.x ?? 0,
        z: p.z ?? 0,
        health: p.health ?? 100,
        ammo: p.ammo ?? 30,
        killed: p.killed ?? 0,
        lastSeen: p.lastSeen ?? 0,
      });
    }
    setPlayerState(Array.from(map.values()));
  }, [playersQuery]);

  // Keep the local cursor in sync with our player state.
  useEffect(() => {
    if (!local) return;
    const p = playerState.find((x) => x.id === local.id);
    if (p) {
      setLocal({ ...local, ...p });
    }
  }, [playerState, local]);

  // ---- Input ----
  useEffect(() => {
    const onPointerLockChange = () => {
      setPointerLocked(document.pointerLockElement === canvasRef.current);
    };
    document.addEventListener("pointerlockchange", onPointerLockChange);
    canvasRef.current?.requestPointerLock();
    return () => document.removeEventListener("pointerlockchange", onPointerLockChange);
  }, [canvasRef]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "w" || e.key === "W" || e.key === "a" || e.key === "A" ||
          e.key === "s" || e.key === "S" || e.key === "d" || e.key === "D") {
        setKeys((k) => ({ ...k, [e.key]: true }));
      }
      if (e.key === " " || e.key === "Space") {
        e.preventDefault();
        fire();
      }
      if (e.key === "Escape") {
        document.exitPointerLock();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      setKeys((k) => {
        const next = { ...k };
        delete next[e.key];
        return next;
      });
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [fire]);

  // Poll movement every frame.
  useEffect(() => {
    const tick = () => {
      if (!pointerLocked || !local) return;
      move();
    };
    const id = setInterval(tick, 16);
    return () => clearInterval(id);
  }, [pointerLocked, local, move]);

  // ---- Movement ----
  function move() {
    if (!pointerLocked || !local) return;
    const forward = keys["w"] || keys["W"];
    const backward = keys["s"] || keys["S"];
    const left = keys["a"] || keys["A"];
    const right = keys["d"] || keys["D"];

    const speed = 0.12;
    const forwardDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const rightDir = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

    let dx = 0;
    let dz = 0;
    if (forward) { dx -= forwardDir.x; dz -= forwardDir.z; }
    if (backward) { dx += forwardDir.x; dz += forwardDir.z; }
    if (left) { dx -= rightDir.x; dz -= rightDir.z; }
    if (right) { dx += rightDir.x; dz += rightDir.z; }

    const len = Math.sqrt(dx * dx + dz * dz) || 1;
    dx /= len;
    dz /= len;

    const newX = local.x + dx * speed;
    const newZ = local.z + dz * speed;
    const border = 8;
    const clampedX = Math.max(-border, Math.min(border, newX));
    const clampedZ = Math.max(-border, Math.min(border, newZ));

    setLocal((p) => (p ? { ...p, x: clampedX, z: clampedZ } : p));
    pushAction(local.id, () => {
      const idx = state.findIndex((x) => x.id === local.id);
      if (idx >= 0) {
        const next = [...state];
        next[idx] = { ...next[idx], x: clampedX, z: clampedZ, lastSeen: Date.now() };
        setPlayerState(next);
      }
    });

  };

  // ---- Shooting ----
  function fire() {
    if (!pointerLocked || !local) return;
    if (local.ammo <= 0) return;

    const origin = camera.position.clone();
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    raycaster.set(origin, direction.normalize());

    const targets: { id: string; position: THREE.Vector3 }[] = [];
    playerState.forEach((p) => {
      if (p.id === local.id) return;
      targets.push({ id: p.id, position: new THREE.Vector3(p.x, 1.5, p.z) });
    });

    for (const t of targets) {
      const dist = origin.distanceTo(t.position);
      if (dist < 6) {
        // Reduce ammo immediately (local feedback), then sync damage.
        setLocal((p) => (p ? { ...p, ammo: p.ammo - 1 } : p));
        pushAction(local.id, () => {
          const idx = state.findIndex((x) => x.id === local.id);
          if (idx >= 0) {
            const next = [...state];
            next[idx] = { ...next[idx], ammo: next[idx].ammo - 1, lastSeen: Date.now() };
            setPlayerState(next);
          }
        });
        hit({ targetUserId: t.id }).then(() => {
          pushAction(t.id, () => {
            const idx = state.findIndex((x) => x.id === t.id);
            if (idx >= 0) {
              const tgt = state[idx];
              const next = [...state];
              next[idx] = { ...next[idx], health: Math.max(0, tgt.health - 1), lastSeen: Date.now() };
              setPlayerState(next);
            }
          });
        });
        // Cooldown
        setTimeout(() => {
          pushAction(local.id, () => {
            const idx = state.findIndex((x) => x.id === local.id);
            if (idx >= 0) {
              const next = [...state];
              next[idx] = { ...next[idx], ammo: Math.max(0, next[idx].ammo - 1), lastSeen: Date.now() };
              setPlayerState(next);
            }
          });
        }, 400);
        break;
      }
    }
  };

  // ---- Game lifecycle ----
  useEffect(() => {
    if (!me) return;
    spawn({ team: (me.team as PlayerState["team"]) ?? "cyan" });
  }, [me, spawn]);

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[#0b1020]">
      <div className="relative h-full w-full">
        <Canvas
          ref={canvasRef}
          camera={{ position: [0, 2, 5], fov: 75 }}
          dpr={[1, 2]}
          className="absolute inset-0 h-full w-full"
        >
          <GameScene players={playerState} />
        </Canvas>

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
          <HUD />
          {!pointerLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <button
                onClick={() => canvasRef.current?.requestPointerLock()}
                className="rounded-full bg-white/10 px-6 py-2 text-sm text-white backdrop-blur"
              >
                Click to play
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
