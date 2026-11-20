import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PieceType } from '../../types/chess';

interface CombatFx3DProps {
  position: [number, number, number]; // Target position (Box 2)
  fromPosition?: [number, number, number]; // Origin position (Box 1)
  attackerType: PieceType;
  victimType?: PieceType;
  progress: number; // 0 to 1 over the 2.25s combat duration
}

export const CombatFx3D: React.FC<CombatFx3DProps> = ({
  position,
  fromPosition,
  attackerType,
  progress,
}) => {
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const secondaryShockwaveRef = useRef<THREE.Mesh>(null);
  const slashArcRef = useRef<THREE.Mesh>(null);
  const dustCloudRef = useRef<THREE.Points>(null);
  const clashSparksRef = useRef<THREE.Points>(null);
  const fromSigilRef = useRef<THREE.Group>(null);
  const toSigilRef = useRef<THREE.Group>(null);
  const lightningRef = useRef<THREE.Mesh>(null);

  const [toX, toY, toZ] = position;
  const [fromX, fromY, fromZ] = fromPosition || position;

  // Melee clash contact midpoint (near Box 2)
  const clashX = THREE.MathUtils.lerp(fromX, toX, 0.72);
  const clashY = 0.45;
  const clashZ = THREE.MathUtils.lerp(fromZ, toZ, 0.72);

  // 1. Finisher Spark particles
  const [finisherPositions, finisherVelocities] = useMemo(() => {
    const count = attackerType === 'r' ? 90 : 60;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.15;
      pos[i * 3 + 1] = 0.1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.15;

      const angle = Math.random() * Math.PI * 2;
      const speed = attackerType === 'r' ? 4.5 + Math.random() * 2.5 : 3.2 + Math.random() * 2;
      vel[i * 3] = Math.cos(angle) * speed;
      vel[i * 3 + 1] = Math.random() * 4.0 + 1.8;
      vel[i * 3 + 2] = Math.sin(angle) * speed;
    }
    return [pos, vel];
  }, [attackerType]);

  // 2. Melee Parry Clash Spark particles (at midpoint)
  const [clashPositions, clashVelocities] = useMemo(() => {
    const count = 45;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.08;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.08;

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 2.2;
      vel[i * 3] = Math.cos(angle) * speed;
      vel[i * 3 + 1] = (Math.random() - 0.2) * 3.0;
      vel[i * 3 + 2] = Math.sin(angle) * speed;
    }
    return [pos, vel];
  }, []);

  // 3. Trajectory ribbon between Box 1 and Box 2
  const [beamLength, beamAngle, beamMidX, beamMidZ] = useMemo(() => {
    const dx = toX - fromX;
    const dz = toZ - fromZ;
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);
    const midX = (fromX + toX) / 2;
    const midZ = (fromZ + toZ) / 2;
    return [len, angle, midX, midZ];
  }, [fromX, fromZ, toX, toZ]);

  useFrame((_, delta) => {
    // Spin War Sigils on both tiles
    if (fromSigilRef.current) {
      fromSigilRef.current.rotation.y += delta * 2.4;
    }
    if (toSigilRef.current) {
      toSigilRef.current.rotation.y -= delta * 1.8;
    }

    // 1. Melee Parry Clash Sparks (at p = 0.25 to 0.55)
    if (clashSparksRef.current && progress >= 0.25 && progress <= 0.55) {
      const geo = clashSparksRef.current.geometry;
      const posAttr = geo.attributes.position as THREE.BufferAttribute;
      const pArr = posAttr.array as Float32Array;
      const clashP = (progress - 0.25) / 0.3;

      for (let i = 0; i < 45; i++) {
        pArr[i * 3] += clashVelocities[i * 3] * delta;
        pArr[i * 3 + 1] += clashVelocities[i * 3 + 1] * delta - 4.5 * delta * clashP;
        pArr[i * 3 + 2] += clashVelocities[i * 3 + 2] * delta;
      }
      posAttr.needsUpdate = true;
    }

    // 2. Expanding Ground Shockwave Ring on Finisher Impact (at p = 0.55 to 0.85)
    if (shockwaveRef.current && progress > 0.55) {
      const p = (progress - 0.55) / 0.3;
      const scale = 0.4 + p * (attackerType === 'r' ? 3.6 : 2.2);
      shockwaveRef.current.scale.set(scale, scale, 1);
      const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, (1 - p) * 0.9);
    }

    if (secondaryShockwaveRef.current && progress > 0.6) {
      const p = (progress - 0.6) / 0.25;
      const scale = 0.2 + p * (attackerType === 'r' ? 2.8 : 1.6);
      secondaryShockwaveRef.current.scale.set(scale, scale, 1);
      const mat = secondaryShockwaveRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, (1 - p) * 0.7);
    }

    // 3. Soldier Luminous Blade Slash Arc Ribbon
    if (slashArcRef.current && progress >= 0.55 && progress <= 0.82) {
      const slashP = (progress - 0.55) / 0.27;
      slashArcRef.current.rotation.z = -Math.PI / 4 + slashP * Math.PI * 0.9;
      slashArcRef.current.rotation.y = slashP * 0.4;
      const mat = slashArcRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.sin(slashP * Math.PI) * 0.95;
    }

    // 4. Ground Dust & Finisher Sparks
    if (dustCloudRef.current && progress > 0.55) {
      const geo = dustCloudRef.current.geometry;
      const posAttr = geo.attributes.position as THREE.BufferAttribute;
      const pArr = posAttr.array as Float32Array;
      const count = attackerType === 'r' ? 90 : 60;
      const finishP = (progress - 0.55) / 0.3;

      for (let i = 0; i < count; i++) {
        pArr[i * 3] += finisherVelocities[i * 3] * delta;
        pArr[i * 3 + 1] += finisherVelocities[i * 3 + 1] * delta - 8.5 * delta * finishP;
        pArr[i * 3 + 2] += finisherVelocities[i * 3 + 2] * delta;
      }
      posAttr.needsUpdate = true;
    }

    // 5. Celestial Lightning Pulse
    if (lightningRef.current && progress >= 0.55 && progress <= 0.82) {
      const lP = (progress - 0.55) / 0.27;
      lightningRef.current.rotation.y += delta * 12;
      const scaleXZ = Math.sin(lP * Math.PI) * 1.3;
      lightningRef.current.scale.set(scaleXZ, 1, scaleXZ);
    }
  });

  return (
    <>
      {/* -------------------------------------------------------- */}
      {/* 1. Box 1 War Sigil (Attacker Tile at fromPosition) */}
      {/* -------------------------------------------------------- */}
      {progress < 0.85 && (
        <group position={[fromX, 0.12, fromZ]} ref={fromSigilRef}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.22, 0.42, 32]} />
            <meshBasicMaterial
              color="#f59e0b"
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.32, 0.35, 16]} />
            <meshBasicMaterial
              color="#fbbf24"
              transparent
              opacity={0.9}
              wireframe
              side={THREE.DoubleSide}
            />
          </mesh>
          <pointLight color="#f59e0b" intensity={3.5} distance={2.5} />
        </group>
      )}

      {/* -------------------------------------------------------- */}
      {/* 2. Box 2 Defense Ward Sigil (Defender Tile at position) */}
      {/* -------------------------------------------------------- */}
      {progress < 0.85 && (
        <group position={[toX, 0.12, toZ]} ref={toSigilRef}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.24, 0.46, 32]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.36, 0.4, 20]} />
            <meshBasicMaterial
              color="#67e8f9"
              transparent
              opacity={0.95}
              wireframe
              side={THREE.DoubleSide}
            />
          </mesh>
          <pointLight color="#38bdf8" intensity={3.5} distance={2.5} />
        </group>
      )}

      {/* -------------------------------------------------------- */}
      {/* 3. Glowing Combat Charge Ribbon between Box 1 and Box 2 */}
      {/* -------------------------------------------------------- */}
      {progress < 0.85 && fromPosition && (
        <mesh
          position={[beamMidX, 0.1, beamMidZ]}
          rotation={[-Math.PI / 2, 0, -beamAngle + Math.PI / 2]}
        >
          <planeGeometry args={[beamLength, 0.08]} />
          <meshBasicMaterial
            color="#f59e0b"
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* -------------------------------------------------------- */}
      {/* 4. Melee Weapon Clash Sparks at Contact Midpoint */}
      {/* -------------------------------------------------------- */}
      {progress >= 0.25 && progress <= 0.55 && (
        <group position={[clashX, clashY, clashZ]}>
          <points ref={clashSparksRef}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[clashPositions, 3]} />
            </bufferGeometry>
            <pointsMaterial
              size={0.08}
              color="#fef08a"
              transparent
              opacity={1}
              blending={THREE.AdditiveBlending}
            />
          </points>

          {/* Contact Flash Flare Light */}
          <pointLight
            position={[0, 0, 0]}
            intensity={9}
            distance={3.2}
            color="#38bdf8"
          />

          {/* Midpoint Contact Flash Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.08, 0.24, 24]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.85} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* -------------------------------------------------------- */}
      {/* 5. Lethal Finisher Shockwaves & Destructive FX (Box 2) */}
      {/* -------------------------------------------------------- */}
      <group position={[toX, toY, toZ]}>
        {/* Primary Expanding Fiery Ground Shockwave Ring */}
        {progress > 0.55 && (
          <mesh ref={shockwaveRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
            <ringGeometry args={[0.2, 0.38, 36]} />
            <meshBasicMaterial
              color={attackerType === 'r' ? '#ea580c' : attackerType === 'k' ? '#fbbf24' : '#f59e0b'}
              transparent
              opacity={0.9}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Secondary Concentric Shockwave Ring */}
        {progress > 0.6 && (
          <mesh ref={secondaryShockwaveRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
            <ringGeometry args={[0.15, 0.28, 32]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Soldier & Camel Luminous Blade Slash Arc Ribbon */}
        {(attackerType === 'p' || attackerType === 'b') && progress >= 0.55 && progress <= 0.82 && (
          <mesh ref={slashArcRef} position={[0, 0.45, 0]} rotation={[0, Math.PI / 4, 0]}>
            <ringGeometry args={[0.45, 0.58, 32, 1, 0, Math.PI * 0.85]} />
            <meshBasicMaterial
              color={attackerType === 'b' ? '#f59e0b' : '#38bdf8'}
              transparent
              opacity={0.95}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Imperial King Celestial Judgment Lightning Column */}
        {attackerType === 'k' && progress >= 0.55 && progress <= 0.82 && (
          <mesh ref={lightningRef} position={[0, 2.2, 0]}>
            <cylinderGeometry args={[0.12, 0.42, 4.8, 16]} />
            <meshBasicMaterial color="#fef08a" transparent opacity={0.88} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Dust Shockwave & Spark Particles */}
        {progress > 0.55 && (
          <points ref={dustCloudRef}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[finisherPositions, 3]} />
            </bufferGeometry>
            <pointsMaterial
              size={attackerType === 'r' ? 0.12 : 0.08}
              color={attackerType === 'r' ? '#ea580c' : attackerType === 'k' ? '#fef08a' : '#fbbf24'}
              transparent
              opacity={Math.max(0, 1 - (progress - 0.55) * 3)}
              blending={THREE.AdditiveBlending}
            />
          </points>
        )}

        {/* Dynamic Lethal Finisher Impact Point Light */}
        {progress >= 0.55 && progress <= 0.78 && (
          <pointLight
            position={[0, 0.9, 0]}
            intensity={attackerType === 'r' || attackerType === 'k' ? 18 : 12}
            distance={attackerType === 'r' || attackerType === 'k' ? 5.5 : 4.0}
            color={attackerType === 'r' ? '#ea580c' : attackerType === 'k' ? '#fef08a' : '#f59e0b'}
          />
        )}
      </group>
    </>
  );
};
