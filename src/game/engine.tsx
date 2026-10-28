import { useRef } from "react";
import { useFrame, useThree } from "react-three-fiber";
import { Center, ContactShadows, Environment, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useSync } from "./sync";
import { PlayerBody, HealthShade } from "./playerMesh";
import { PlayerState } from "./types";

export function GameScene({ players }: { players: PlayerState[] }) {
  return (
    <>
      <color attach="background" args={["#0b1020"]} />
      <CameraRig players={players} />
      <Center>
        <ambientLight intensity={0.45} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} />
        <pointLight position={[-10, 10, -10]} intensity={0.6} />
      </Center>
      <ContactShadows position={[0, -0.05, 0]} opacity={0.25} scale={20} blur={1.2} far={2} />
      <Environment preset="night" />
      <Stars radius={100} depth={50} factor={4} />
    </>
  );
}

function CameraRig({ players }: { players: PlayerState[] }) {
  const { camera } = useThree();
  const { state, activePlayerId } = useSync();

  const controlled = state.find((p) => p.id === activePlayerId) ?? null;

  useFrame(() => {
    if (controlled) {
      const t = new THREE.Vector3(controlled.x, 2.5, controlled.z);
      const e = camera.position;
      e.x += (t.x - e.x) * 0.06;
      e.y += (t.y - e.y) * 0.06;
      e.z += (t.z - e.z) * 0.06;
      const dir = new THREE.Vector3(t.x, t.y + 0.6, t.z).sub(e).normalize();
      camera.quaternion.setFromUnitVectors(camera.up, dir.clone().negate());
      return;
    }

    const cyan = players.find((p) => p.team === "cyan");
    const mag = players.find((p) => p.team === "magenta");
    const cx = cyan?.x ?? 0;
    const cz = cyan?.z ?? 0;
    const mx = mag?.x ?? 0;
    const mz = mag?.z ?? 0;
    const tx = (cx + mx) / 2;
    const tz = (cz + mz) / 2;
    const e = camera.position;
    e.x += (tx - e.x) * 0.06;
    e.y += (3 - e.y) * 0.06;
    e.z += (tz - e.z) * 0.06;
    const dir = new THREE.Vector3(tx, 2, tz).sub(e).normalize();
    camera.quaternion.setFromUnitVectors(camera.up, dir.clone().negate());
  });

  return (
    <group>
      {players.map((p) => {
        const bodyRef = useRef<THREE.Group>(null);
        return (
          <group key={p.id}>
            <PlayerBody player={p} meshRef={bodyRef} />
            <HealthShade player={p} />
          </group>
        );
      })}
    </group>
  );
}
