import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { PieceType, Color } from '../../types/chess';
import { useChessStore } from '../../stores/useChessStore';

interface MovieBattleCinemaProps {
  attackerColor: Color;
  attackerType: PieceType;
  victimColor: Color;
  victimType: PieceType;
  onFinished: () => void;
}

// Procedural 3D Armored Soldier Model with articulated weapon & shield
interface Soldier3DProps {
  color: Color;
  type: PieceType;
  isAttacker: boolean;
  time: number;
}

const Soldier3D: React.FC<Soldier3DProps> = ({ color, type, isAttacker, time }) => {
  const groupRef = useRef<THREE.Group>(null);
  const weaponArmRef = useRef<THREE.Group>(null);
  const shieldArmRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  const isWhite = color === 'w';

  // Materials: White = Gleaming Ivory & Gold; Black = Burnished Obsidian & Crimson
  const armorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isWhite ? '#e2e8f0' : '#1e1e24',
        roughness: isWhite ? 0.25 : 0.4,
        metalness: isWhite ? 0.6 : 0.85,
      }),
    [isWhite]
  );

  const trimMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isWhite ? '#d4af37' : '#991b1b',
        roughness: 0.15,
        metalness: 0.9,
      }),
    [isWhite]
  );

  const steelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.1,
        metalness: 0.95,
      }),
    []
  );

  useFrame(() => {
    if (!groupRef.current) return;

    if (isAttacker) {
      // Attacker Choreography:
      // t < 0.5: Sprint charge forward
      // t 0.5 - 0.7: Leap and overhead weapon strike
      // t 0.7 - 1.4: Follow-through and plant weapon in victory stance
      if (time < 0.5) {
        const prog = time / 0.5;
        groupRef.current.position.set(-2.8 + prog * 1.8, Math.sin(time * 18) * 0.08, 0);
        groupRef.current.rotation.set(0, Math.PI / 2, 0.15); // lean into charge
        if (weaponArmRef.current) {
          weaponArmRef.current.rotation.set(-0.3 - prog * 0.8, 0, 0.2); // raise weapon high
        }
      } else if (time < 0.85) {
        // Slow-mo cinematic leap & strike
        const strikeProg = (time - 0.5) / 0.35;
        const jumpY = Math.sin(strikeProg * Math.PI) * 0.45;
        groupRef.current.position.set(-1.0 + strikeProg * 0.3, jumpY, 0);
        groupRef.current.rotation.set(0, Math.PI / 2, -0.1);
        if (weaponArmRef.current) {
          // Cleaving downward strike
          weaponArmRef.current.rotation.set(0.6 + strikeProg * 1.2, 0, 0);
        }
      } else {
        // Victory landing stance
        groupRef.current.position.set(-0.7, 0, 0);
        groupRef.current.rotation.set(0, Math.PI / 2.2, 0);
        if (weaponArmRef.current) {
          weaponArmRef.current.rotation.set(0.4, 0, 0.3);
        }
      }
    } else {
      // Defender Choreography:
      // t < 0.65: Bracing with shield in defense
      // t 0.65: IMPACT! Shield knocked away, soldier staggers
      // t 0.85 - 1.5: Collapses down to knees and falls forward
      if (time < 0.65) {
        groupRef.current.position.set(0.8, 0, 0);
        groupRef.current.rotation.set(0, -Math.PI / 2, -0.1); // defensive brace
        if (shieldArmRef.current) {
          shieldArmRef.current.rotation.set(0.6, 0.4, 0); // shield up high
        }
      } else if (time < 1.1) {
        const impactProg = (time - 0.65) / 0.45;
        // Stumble backward with recoil
        groupRef.current.position.set(0.8 + impactProg * 0.6, 0, 0);
        groupRef.current.rotation.set(
          -impactProg * 0.3,
          -Math.PI / 2,
          impactProg * 0.6 // tilt back
        );
        if (shieldArmRef.current) {
          // Shield flying off to the side
          shieldArmRef.current.position.set(0.2 + impactProg * 1.2, 0.5 - impactProg * 0.5, 0.3);
          shieldArmRef.current.rotation.set(impactProg * 4, impactProg * 2, 0);
        }
      } else {
        // Fallen soldier collapsed on knees
        const fallProg = Math.min(1, (time - 1.1) / 0.4);
        groupRef.current.position.set(1.4, -fallProg * 0.35, 0);
        groupRef.current.rotation.set(0, -Math.PI / 2, 1.2 * fallProg); // fallen to ground
        if (shieldArmRef.current) {
          shieldArmRef.current.position.set(1.8, -0.3, 0.6);
        }
      }
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        {/* Torso / Breastplate */}
        <mesh position={[0, 0.65, 0]} material={armorMat} castShadow>
          <cylinderGeometry args={[0.22, 0.17, 0.5, 12]} />
        </mesh>

        {/* Golden / Crimson Chest Emblem Trim */}
        <mesh position={[0, 0.72, 0.1]} material={trimMat}>
          <boxGeometry args={[0.18, 0.12, 0.04]} />
        </mesh>

        {/* Belt & Waist Armor */}
        <mesh position={[0, 0.38, 0]} material={trimMat}>
          <cylinderGeometry args={[0.18, 0.19, 0.1, 12]} />
        </mesh>

        {/* Left Leg */}
        <mesh position={[-0.09, 0.18, 0]} material={armorMat} castShadow>
          <cylinderGeometry args={[0.07, 0.06, 0.36, 8]} />
        </mesh>

        {/* Right Leg */}
        <mesh position={[0.09, 0.18, 0]} material={armorMat} castShadow>
          <cylinderGeometry args={[0.07, 0.06, 0.36, 8]} />
        </mesh>

        {/* Head & Armored Helmet */}
        <group position={[0, 1.05, 0]}>
          <mesh material={armorMat} castShadow>
            <sphereGeometry args={[0.17, 16, 16]} />
          </mesh>
          {/* Helmet Visor */}
          <mesh position={[0, 0.01, 0.12]} material={trimMat}>
            <boxGeometry args={[0.18, 0.06, 0.06]} />
          </mesh>
          {/* Roman/Spartan Helmet Crest Plume */}
          <mesh position={[0, 0.15, -0.02]} material={trimMat}>
            <boxGeometry args={[0.04, 0.14, 0.28]} />
          </mesh>
        </group>

        {/* Left Shoulder Pauldron */}
        <mesh position={[-0.24, 0.8, 0]} material={trimMat}>
          <sphereGeometry args={[0.1, 10, 10]} />
        </mesh>

        {/* Right Shoulder Pauldron */}
        <mesh position={[0.24, 0.8, 0]} material={trimMat}>
          <sphereGeometry args={[0.1, 10, 10]} />
        </mesh>

        {/* Arm Holding Weapon */}
        <group ref={weaponArmRef} position={[0.24, 0.75, 0]}>
          <mesh position={[0, -0.15, 0.08]} material={armorMat}>
            <cylinderGeometry args={[0.05, 0.04, 0.32, 8]} />
          </mesh>

          {/* Weapon Based on Piece Type */}
          {type === 'p' && (
            // Long Spear with Steel Blade
            <group position={[0, -0.1, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh material={steelMat} castShadow>
                <cylinderGeometry args={[0.018, 0.018, 1.7, 8]} />
              </mesh>
              <mesh position={[0, 0.95, 0]} material={steelMat}>
                <coneGeometry args={[0.06, 0.28, 6]} />
              </mesh>
              <mesh position={[0, 0.78, 0]} material={trimMat}>
                <cylinderGeometry args={[0.035, 0.035, 0.06, 8]} />
              </mesh>
            </group>
          )}

          {type === 'n' && (
            // Heavy Cavalry Broadsword
            <group position={[0, -0.05, 0.4]} rotation={[Math.PI / 2.2, 0, 0]}>
              <mesh material={steelMat} castShadow>
                <boxGeometry args={[0.07, 1.25, 0.02]} />
              </mesh>
              <mesh position={[0, -0.65, 0]} material={trimMat}>
                <boxGeometry args={[0.26, 0.04, 0.05]} />
              </mesh>
            </group>
          )}

          {type === 'r' && (
            // Cataclysmic Siege Warhammer
            <group position={[0, -0.05, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh material={armorMat} castShadow>
                <cylinderGeometry args={[0.03, 0.03, 1.3, 8]} />
              </mesh>
              <mesh position={[0, 0.68, 0]} material={trimMat}>
                <boxGeometry args={[0.24, 0.24, 0.24]} />
              </mesh>
            </group>
          )}

          {(type === 'q' || type === 'b' || type === 'k') && (
            // Royal Scythe / Sword
            <group position={[0, -0.05, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh material={steelMat} castShadow>
                <boxGeometry args={[0.06, 1.4, 0.02]} />
              </mesh>
              <mesh position={[0, -0.7, 0]} material={trimMat}>
                <boxGeometry args={[0.28, 0.05, 0.06]} />
              </mesh>
            </group>
          )}
        </group>

        {/* Off-Hand with Heavy Shield */}
        <group ref={shieldArmRef} position={[-0.24, 0.75, 0]}>
          <mesh position={[0, -0.15, 0.08]} material={armorMat}>
            <cylinderGeometry args={[0.05, 0.04, 0.32, 8]} />
          </mesh>

          {/* Round Hoplite Battle Shield */}
          <group position={[-0.08, -0.1, 0.22]} rotation={[0, Math.PI / 4, 0]}>
            <mesh material={armorMat} castShadow>
              <cylinderGeometry args={[0.34, 0.34, 0.04, 24]} />
            </mesh>
            <mesh material={trimMat}>
              <torusGeometry args={[0.34, 0.03, 8, 24]} />
            </mesh>
            <mesh position={[0, 0.025, 0]} material={trimMat}>
              <sphereGeometry args={[0.08, 12, 12]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

// 3D Battle Impact Sparks Particle Emitter
const BattleSparks: React.FC<{ time: number }> = ({ time }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, velocities] = useMemo(() => {
    const count = 45;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = -0.3 + (Math.random() - 0.5) * 0.2;
      pos[i * 3 + 1] = 0.8 + (Math.random() - 0.5) * 0.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.2;

      vel[i * 3] = (Math.random() - 0.3) * 6;
      vel[i * 3 + 1] = Math.random() * 5 + 1.5;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return [pos, vel];
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current || time < 0.65) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const pArr = posAttr.array as Float32Array;

    const tSinceImpact = time - 0.65;
    for (let i = 0; i < 45; i++) {
      pArr[i * 3] += velocities[i * 3] * delta;
      pArr[i * 3 + 1] += velocities[i * 3 + 1] * delta - 9.8 * delta * tSinceImpact;
      pArr[i * 3 + 2] += velocities[i * 3 + 2] * delta;
    }
    posAttr.needsUpdate = true;
  });

  if (time < 0.65 || time > 1.3) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#fbbf24"
        transparent
        opacity={Math.max(0, 1 - (time - 0.65) * 1.8)}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Shockwave Ring Expanding at Contact
const ContactShockwave: React.FC<{ time: number }> = ({ time }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current && time >= 0.65) {
      meshRef.current.scale.x += delta * 9;
      meshRef.current.scale.y += delta * 9;
    }
  });

  if (time < 0.65 || time > 1.25) return null;

  const opacity = Math.max(0, 1 - (time - 0.65) * 2.2);

  return (
    <mesh ref={meshRef} position={[-0.3, 0.8, 0]} rotation={[0, Math.PI / 2, 0]}>
      <ringGeometry args={[0.1, 0.28, 32]} />
      <meshBasicMaterial color="#ef4444" transparent opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Dynamic Cinematic Movie Camera with Dutch Tilt and Slow-Mo Orbit
const MovieCameraDolly: React.FC<{ time: number }> = ({ time }) => {
  const camRef = useRef<THREE.Vector3>(new THREE.Vector3());

  useFrame(({ camera }) => {
    if (time < 0.5) {
      // Shot 1: Low dynamic tracking shot behind attacker
      const p = time / 0.5;
      camera.position.set(-2.5 + p * 1.2, 0.8, 2.2 - p * 0.4);
      camRef.current.set(0.2, 0.7, 0);
      camera.lookAt(camRef.current);
    } else if (time < 1.1) {
      // Shot 2: Slow-motion orbit shot at point of impact (Bullet Time!)
      const p = (time - 0.5) / 0.6;
      const angle = p * Math.PI * 0.45;
      const radius = 2.4;
      camera.position.set(-0.3 + Math.sin(angle) * radius, 0.9 + Math.sin(p * Math.PI) * 0.2, Math.cos(angle) * radius);
      // Screen shake at impact t = 0.65
      if (time >= 0.65 && time <= 0.85) {
        camera.position.x += (Math.random() - 0.5) * 0.08;
        camera.position.y += (Math.random() - 0.5) * 0.08;
      }
      camRef.current.set(0, 0.75, 0);
      camera.lookAt(camRef.current);
    } else {
      // Shot 3: Grand aftermath wide shot
      const p = (time - 1.1) / 0.8;
      camera.position.lerp(new THREE.Vector3(0, 1.3, 3.5), p * 0.1);
      camRef.current.lerp(new THREE.Vector3(0.2, 0.5, 0), p * 0.1);
      camera.lookAt(camRef.current);
    }
  });

  return null;
};

export const MovieBattleCinema: React.FC<MovieBattleCinemaProps> = ({
  attackerColor,
  attackerType,
  victimColor,
  victimType,
  onFinished,
}) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animId: number;
    let startTime: number | null = null;

    const update = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = (now - startTime) / 1000;
      setTime(elapsed);

      if (elapsed >= 2.1) {
        onFinished();
        return;
      }
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [onFinished]);

  return (
    <div className="w-full h-full relative cursor-pointer" onClick={onFinished}>
      <Canvas
        shadows
        className="w-full h-full"
        camera={{ position: [-2.5, 0.8, 2.2], fov: 38 }}
      >
        <MovieCameraDolly time={time} />

        {/* Ambient Mist & Fog */}
        <color attach="background" args={['#050608']} />
        <ambientLight intensity={0.55} />

        {/* Cinematic Key Light (Warm Amber Rim Fire) */}
        <directionalLight
          position={[-4, 5, 3]}
          intensity={2.2}
          color="#f59e0b"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        {/* Cool Atmospheric Rim Light */}
        <directionalLight position={[4, 3, -3]} intensity={1.1} color="#38bdf8" />

        {/* Dramatic Impact Flash Light */}
        {time >= 0.65 && time <= 0.9 && (
          <pointLight position={[-0.3, 0.9, 0]} intensity={12} distance={6} color="#fbbf24" />
        )}

        {/* Ruined Medieval Chess Battlefield Floor */}
        <mesh position={[0, -0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[16, 16]} />
          <meshStandardMaterial color="#111318" roughness={0.7} metalness={0.2} />
        </mesh>

        {/* Procedural 3D Combatants */}
        <Soldier3D
          color={attackerColor}
          type={attackerType}
          isAttacker={true}
          time={time}
        />

        <Soldier3D
          color={victimColor}
          type={victimType}
          isAttacker={false}
          time={time}
        />

        {/* Kinetic Clash Particles */}
        <BattleSparks time={time} />
        <ContactShockwave time={time} />

        {/* Ground Shadows */}
        <ContactShadows position={[0, 0, 0]} opacity={0.8} scale={10} blur={2} far={4} />
      </Canvas>
    </div>
  );
};
