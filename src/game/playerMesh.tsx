import { useFrame, useThree } from "react-three-fiber";
import * as THREE from "three";
import { useSync } from "./sync";
import { PlayerState } from "./types";
import { useMemo } from "react";

const TEAM_COLOR: Record<PlayerState["team"], string> = {
  cyan: "#22d3ee",
  magenta: "#f472b6",
};

export function HealthShade({ player }: { player: PlayerState }) {
  const { state } = useSync();
  const current = state.find((p) => p.id === player.id) ?? player;

  return (
    <group>
      <mesh position={[0, 1.4, 0]}>
        <planeGeometry args={[1.5, 0.45]} />
        <meshStandardMaterial color="#475569" wireframe roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <planeGeometry args={[1.5, (current.health / 100) * 1.5]} />
        <meshStandardMaterial color={current.health > 50 ? "#22d3ee" : current.health > 25 ? "#fbbf24" : "#ef4444"} />
      </mesh>
    </group>
  );
}

export function PlayerBody({ player, meshRef }: { player: PlayerState; meshRef: any }) {
  const { camera } = useThree();
  const { state } = useSync();

  // Resolve the latest player snapshot.
  const current = useMemo(() => state.find((p) => p.id === player.id) ?? player, [state, player.id]);

  // The mesh position updates every frame so that new players appear
  // and existing ones can be moved by mutations.
  useFrame(() => {
    if (!meshRef.current || !current) return;
    const obj = meshRef.current;
    obj.position.set(current.x, 0, current.z);

    // Rotate so the body tracks the local player's camera for a first-person feel.
    const dir = new THREE.Vector3(camera.position.x, 0, camera.position.z);
    dir.sub(obj.position).normalize();
    obj.rotation.y = -Math.atan2(dir.x, dir.z) + Math.PI / 2;
  });

  return (
    <group ref={meshRef}>
      {/* Body */}
      <mesh>
        <cylinderGeometry args={[0.4, 0.45, 1.7, 12]} />
        <meshStandardMaterial color={TEAM_COLOR[current.team]} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color={TEAM_COLOR[current.team]} roughness={0.6} />
      </mesh>
      {/* Gun (held in front) */}
      <group position={[0.65, 0.35, 0.65]}>
        <mesh>
          <boxGeometry args={[0.6, 0.18, 0.14]} />
          <meshStandardMaterial color="#3f3f46" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.09, -0.07]}>
          <cylinderGeometry args={[0.05, 0.05, 0.14]} />
          <meshStandardMaterial color="#9ca3af" roughness={0.4} />
        </mesh>
        <mesh position={[0.12, 0.02, 0.04]}>
          <boxGeometry args={[0.12, 0.04, 0.06]} />
          <meshStandardMaterial color="#4b5563" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
