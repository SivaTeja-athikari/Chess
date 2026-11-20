import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PieceType, Color } from '../../types/chess';

interface ChessPiece3DProps {
  type: PieceType;
  color: Color;
  targetPos: [number, number, number];
  combatFromPos?: [number, number, number];
  isSelected?: boolean;
  onClick?: () => void;
  isAttackingInCombat?: boolean;
  combatProgress?: number | null;
}

// Generate smooth Bezier-like lathe spline profiles for Staunton pieces
function createStauntonProfiles() {
  // 1. Pawn Profile
  const pawnPoints = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.35, 0),
    new THREE.Vector2(0.35, 0.05),
    new THREE.Vector2(0.31, 0.08),
    new THREE.Vector2(0.27, 0.12),
    new THREE.Vector2(0.23, 0.16),
    new THREE.Vector2(0.15, 0.35),
    new THREE.Vector2(0.13, 0.48),
    new THREE.Vector2(0.21, 0.52),
    new THREE.Vector2(0.19, 0.56),
    new THREE.Vector2(0.13, 0.60),
    new THREE.Vector2(0.20, 0.72),
    new THREE.Vector2(0.19, 0.82),
    new THREE.Vector2(0.12, 0.90),
    new THREE.Vector2(0, 0.94),
  ];

  // 2. Rook Profile
  const rookPoints = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.38, 0),
    new THREE.Vector2(0.38, 0.06),
    new THREE.Vector2(0.34, 0.09),
    new THREE.Vector2(0.30, 0.14),
    new THREE.Vector2(0.26, 0.20),
    new THREE.Vector2(0.22, 0.45),
    new THREE.Vector2(0.21, 0.65),
    new THREE.Vector2(0.28, 0.72),
    new THREE.Vector2(0.33, 0.76),
    new THREE.Vector2(0.33, 0.96),
    new THREE.Vector2(0.24, 0.96),
    new THREE.Vector2(0.24, 0.86),
    new THREE.Vector2(0, 0.86),
  ];

  // 3. Bishop Profile
  const bishopPoints = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.38, 0),
    new THREE.Vector2(0.38, 0.06),
    new THREE.Vector2(0.33, 0.10),
    new THREE.Vector2(0.28, 0.15),
    new THREE.Vector2(0.23, 0.22),
    new THREE.Vector2(0.15, 0.50),
    new THREE.Vector2(0.14, 0.65),
    new THREE.Vector2(0.22, 0.70),
    new THREE.Vector2(0.19, 0.75),
    new THREE.Vector2(0.14, 0.78),
    new THREE.Vector2(0.22, 0.92),
    new THREE.Vector2(0.23, 1.08),
    new THREE.Vector2(0.18, 1.20),
    new THREE.Vector2(0.10, 1.26),
    new THREE.Vector2(0, 1.30),
  ];

  // 4. Queen Profile
  const queenPoints = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.42, 0),
    new THREE.Vector2(0.42, 0.07),
    new THREE.Vector2(0.37, 0.11),
    new THREE.Vector2(0.31, 0.16),
    new THREE.Vector2(0.26, 0.24),
    new THREE.Vector2(0.17, 0.55),
    new THREE.Vector2(0.16, 0.75),
    new THREE.Vector2(0.25, 0.82),
    new THREE.Vector2(0.22, 0.88),
    new THREE.Vector2(0.16, 0.92),
    new THREE.Vector2(0.26, 1.10),
    new THREE.Vector2(0.35, 1.28),
    new THREE.Vector2(0.31, 1.32),
    new THREE.Vector2(0.15, 1.30),
    new THREE.Vector2(0, 1.30),
  ];

  // 5. King Profile
  const kingPoints = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.44, 0),
    new THREE.Vector2(0.44, 0.07),
    new THREE.Vector2(0.39, 0.12),
    new THREE.Vector2(0.33, 0.18),
    new THREE.Vector2(0.27, 0.26),
    new THREE.Vector2(0.18, 0.60),
    new THREE.Vector2(0.17, 0.82),
    new THREE.Vector2(0.28, 0.90),
    new THREE.Vector2(0.24, 0.96),
    new THREE.Vector2(0.18, 1.00),
    new THREE.Vector2(0.29, 1.18),
    new THREE.Vector2(0.33, 1.32),
    new THREE.Vector2(0.28, 1.40),
    new THREE.Vector2(0.18, 1.42),
    new THREE.Vector2(0, 1.42),
  ];

  // 6. Knight Pedestal Profile
  const knightBasePoints = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.38, 0),
    new THREE.Vector2(0.38, 0.06),
    new THREE.Vector2(0.33, 0.10),
    new THREE.Vector2(0.28, 0.16),
    new THREE.Vector2(0.24, 0.24),
    new THREE.Vector2(0, 0.26),
  ];

  return {
    pawn: new THREE.LatheGeometry(pawnPoints, 32),
    rook: new THREE.LatheGeometry(rookPoints, 32),
    bishop: new THREE.LatheGeometry(bishopPoints, 32),
    queen: new THREE.LatheGeometry(queenPoints, 32),
    king: new THREE.LatheGeometry(kingPoints, 32),
    knightBase: new THREE.LatheGeometry(knightBasePoints, 32),
  };
}

const GEOMETRIES = createStauntonProfiles();

export interface PieceModelMesh3DProps {
  type: PieceType;
  color: Color;
  materialProps: any;
  isCombatAttacker?: boolean;
  combatProgress?: number | null;
}

export const PieceModelMesh3D: React.FC<PieceModelMesh3DProps> = ({
  type,
  color,
  materialProps,
  isCombatAttacker = false,
}) => {
  const isWhite = color === 'w';
  const bladeGlowColor = isWhite ? '#38bdf8' : '#ef4444';

  switch (type) {
    case 'p':
      return (
        <group>
          <mesh geometry={GEOMETRIES.pawn} castShadow receiveShadow>
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          {isCombatAttacker ? (
            <group>
              {/* Left Arm: Hoplite Battle Shield with Emblem */}
              <group position={[-0.24, 0.46, 0.08]} rotation={[0.2, 0.4, -0.2]}>
                <mesh castShadow receiveShadow>
                  <cylinderGeometry args={[0.22, 0.22, 0.03, 24]} />
                  <meshStandardMaterial color={isWhite ? '#f8fafc' : '#1e293b'} roughness={0.2} metalness={0.7} />
                </mesh>
                <mesh position={[0, 0.02, 0]}>
                  <ringGeometry args={[0.14, 0.2, 24]} />
                  <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
                </mesh>
              </group>
              {/* Right Hand: Drawn Luminous Broadsword */}
              <group position={[0.26, 0.52, 0.12]} rotation={[0.3, -0.3, 0.2]}>
                <mesh position={[0, 0.28, 0]} castShadow>
                  <boxGeometry args={[0.045, 0.55, 0.018]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    roughness={0.1}
                    metalness={0.95}
                    emissive={bladeGlowColor}
                    emissiveIntensity={0.6}
                  />
                </mesh>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.16, 0.035, 0.04]} />
                  <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.85} />
                </mesh>
              </group>
            </group>
          ) : (
            <group position={[0.2, 0.42, 0]} rotation={[0, 0, -0.2]}>
              <mesh castShadow>
                <boxGeometry args={[0.025, 0.42, 0.012]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.15} metalness={0.9} />
              </mesh>
              <mesh position={[0, -0.21, 0]}>
                <boxGeometry args={[0.08, 0.02, 0.02]} />
                <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.85} />
              </mesh>
            </group>
          )}
        </group>
      );

    case 'r':
      return (
        <group>
          <mesh geometry={GEOMETRIES.rook} castShadow receiveShadow>
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
            <mesh
              key={idx}
              position={[Math.cos(angle) * 0.26, 0.98, Math.sin(angle) * 0.26]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.08, 0.14, 0.08]} />
              <meshPhysicalMaterial {...materialProps} />
            </mesh>
          ))}
          <group position={[0, 0.46, 0.22]}>
            <mesh position={[-0.14, 0, 0]} rotation={[0.42, 0, -0.25]} castShadow>
              <coneGeometry args={[0.035, 0.28, 8]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.25} metalness={0.1} />
            </mesh>
            <mesh position={[0.14, 0, 0]} rotation={[0.42, 0, 0.25]} castShadow>
              <coneGeometry args={[0.035, 0.28, 8]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.25} metalness={0.1} />
            </mesh>
            <mesh position={[0, -0.06, 0.08]} rotation={[0.55, 0, 0]} castShadow>
              <cylinderGeometry args={[0.052, 0.038, 0.26, 8]} />
              <meshPhysicalMaterial {...materialProps} />
            </mesh>
          </group>
        </group>
      );

    case 'n':
      return (
        <group>
          <mesh geometry={GEOMETRIES.knightBase} castShadow receiveShadow>
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.52, 0.02]} rotation={[0.18, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.26, 0.54, 0.36]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.72, 0.16]} rotation={[-0.42, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.22, 0.32, 0.38]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.66, -0.14]} rotation={[0.4, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.08, 0.44, 0.16]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          <mesh position={[-0.07, 0.95, 0.05]} rotation={[-0.2, 0, -0.2]} castShadow receiveShadow>
            <coneGeometry args={[0.04, 0.14, 8]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          <mesh position={[0.07, 0.95, 0.05]} rotation={[-0.2, 0, 0.2]} castShadow receiveShadow>
            <coneGeometry args={[0.04, 0.14, 8]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.82, 0.26]} rotation={[0.6, 0, 0]} castShadow>
            <coneGeometry args={[0.025, 0.15, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      );

    case 'b':
      return (
        <group>
          <mesh geometry={GEOMETRIES.bishop} castShadow receiveShadow>
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 1.34, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.07, 24, 24]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
          </mesh>
          <group position={[0.18, 0.65, 0]} rotation={[0, 0, -0.3]}>
            <mesh castShadow>
              <boxGeometry args={[0.02, 0.48, 0.06]} />
              <meshStandardMaterial
                color="#38bdf8"
                roughness={0.2}
                metalness={0.9}
                emissive="#38bdf8"
                emissiveIntensity={0.3}
              />
            </mesh>
            <mesh position={[0, -0.24, 0]}>
              <boxGeometry args={[0.08, 0.03, 0.04]} />
              <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.85} />
            </mesh>
          </group>
          {isCombatAttacker && (
            <group position={[-0.18, 0.65, 0]} rotation={[0, 0, 0.3]}>
              <mesh castShadow>
                <boxGeometry args={[0.02, 0.48, 0.06]} />
                <meshStandardMaterial
                  color="#38bdf8"
                  roughness={0.2}
                  metalness={0.9}
                  emissive="#38bdf8"
                  emissiveIntensity={0.3}
                />
              </mesh>
              <mesh position={[0, -0.24, 0]}>
                <boxGeometry args={[0.08, 0.03, 0.04]} />
                <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.85} />
              </mesh>
            </group>
          )}
        </group>
      );

    case 'q':
      return (
        <group>
          <mesh geometry={GEOMETRIES.queen} castShadow receiveShadow>
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 1.35, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.08, 24, 24]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
          </mesh>
          {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4].map((rad, i) => (
            <mesh key={i} position={[Math.cos(rad) * 0.33, 1.32, Math.sin(rad) * 0.33]} castShadow>
              <sphereGeometry args={[0.032, 12, 12]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
            </mesh>
          ))}
          {isCombatAttacker && (
            <group position={[0, 0.8, -0.1]}>
              <mesh position={[-0.35, 0.2, 0]} rotation={[0, 0.3, 0.4]}>
                <planeGeometry args={[0.5, 0.8]} />
                <meshBasicMaterial color="#fef08a" transparent opacity={0.65} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0.35, 0.2, 0]} rotation={[0, -0.3, -0.4]}>
                <planeGeometry args={[0.5, 0.8]} />
                <meshBasicMaterial color="#fef08a" transparent opacity={0.65} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )}
        </group>
      );

    case 'k':
      return (
        <group>
          <mesh geometry={GEOMETRIES.king} castShadow receiveShadow>
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          <group position={[0, 1.54, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.06, 0.24, 0.06]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
            </mesh>
            <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.18, 0.06, 0.06]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
            </mesh>
            <mesh position={[0, 0.04, 0]}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshStandardMaterial color="#f7ecd0" metalness={0.3} roughness={0.1} />
            </mesh>
          </group>
          {isCombatAttacker && (
            <group position={[0.28, 0.9, 0.1]} rotation={[0.2, 0, -0.3]}>
              <mesh position={[0, 0.35, 0]} castShadow>
                <boxGeometry args={[0.06, 0.7, 0.02]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#fbbf24"
                  emissiveIntensity={0.8}
                  roughness={0.1}
                  metalness={0.95}
                />
              </mesh>
            </group>
          )}
        </group>
      );
  }
};

export const ChessPiece3D: React.FC<ChessPiece3DProps> = ({
  type,
  color,
  targetPos,
  combatFromPos,
  isSelected = false,
  onClick,
  isAttackingInCombat = false,
  combatProgress = null,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef<THREE.Vector3>(new THREE.Vector3(...targetPos));
  const isWhite = color === 'w';

  const materialProps = useMemo(() => {
    if (isWhite) {
      return {
        color: '#f5f3ec',
        roughness: 0.14,
        metalness: 0.04,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12,
        reflectivity: 0.95,
      };
    } else {
      return {
        color: '#151922',
        roughness: 0.22,
        metalness: 0.28,
        clearcoat: 0.65,
        clearcoatRoughness: 0.18,
        reflectivity: 0.85,
      };
    }
  }, [isWhite]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (isAttackingInCombat && combatProgress !== undefined && combatProgress !== null) {
      const from = combatFromPos || targetPos;
      const to = targetPos;

      if (combatProgress < 0.25) {
        const chargeP = combatProgress / 0.25;
        const curX = THREE.MathUtils.lerp(from[0], to[0], chargeP * 0.72);
        const curZ = THREE.MathUtils.lerp(from[2], to[2], chargeP * 0.72);
        const arcY = to[1] + Math.sin(chargeP * Math.PI) * 0.35;
        groupRef.current.position.set(curX, arcY, curZ);
        groupRef.current.rotation.x = 0.2;
        return;
      }

      if (combatProgress >= 0.25 && combatProgress < 0.55) {
        const clashP = (combatProgress - 0.25) / 0.3;
        const strikeOffset = Math.sin(clashP * Math.PI * 2) * 0.16;
        const curX =
          THREE.MathUtils.lerp(from[0], to[0], 0.72) + (to[0] - from[0]) * strikeOffset * 0.2;
        const curZ =
          THREE.MathUtils.lerp(from[2], to[2], 0.72) + (to[2] - from[2]) * strikeOffset * 0.2;
        groupRef.current.position.set(curX, to[1], curZ);

        if (type === 'r') {
          groupRef.current.rotation.x = -Math.sin(clashP * Math.PI) * 0.3;
        } else if (type === 'p' || type === 'b') {
          groupRef.current.rotation.x = Math.sin(clashP * Math.PI * 2) * 0.35;
          groupRef.current.rotation.z = Math.sin(clashP * Math.PI) * 0.25;
        } else if (type === 'n') {
          groupRef.current.rotation.x = -Math.sin(clashP * Math.PI) * 0.35;
        } else {
          groupRef.current.rotation.x = Math.sin(clashP * Math.PI) * 0.25;
        }
        return;
      }

      if (combatProgress >= 0.55 && combatProgress < 0.85) {
        const finishP = (combatProgress - 0.55) / 0.3;
        const curX = THREE.MathUtils.lerp(
          THREE.MathUtils.lerp(from[0], to[0], 0.72),
          to[0],
          finishP
        );
        const curZ = THREE.MathUtils.lerp(
          THREE.MathUtils.lerp(from[2], to[2], 0.72),
          to[2],
          finishP
        );
        groupRef.current.position.set(curX, to[1], curZ);

        if (type === 'r') {
          if (finishP < 0.45) {
            const rearP = Math.sin((finishP / 0.45) * (Math.PI / 2));
            groupRef.current.rotation.x = -rearP * 0.55;
            groupRef.current.position.y = to[1] + rearP * 0.45;
          } else {
            const stompP = (finishP - 0.45) / 0.55;
            groupRef.current.rotation.x = THREE.MathUtils.lerp(-0.55, 0, stompP);
            groupRef.current.position.y = THREE.MathUtils.lerp(to[1] + 0.45, to[1], stompP);
          }
        } else if (type === 'p') {
          const leapP = Math.sin(finishP * Math.PI);
          groupRef.current.rotation.x = leapP * 0.5;
          groupRef.current.position.y = to[1] + leapP * 0.3;
        } else if (type === 'n') {
          const rearP = Math.sin(finishP * Math.PI);
          groupRef.current.rotation.x = -rearP * 0.6;
          groupRef.current.position.y = to[1] + rearP * 0.35;
        } else if (type === 'q') {
          groupRef.current.rotation.y = finishP * Math.PI * 4;
          groupRef.current.position.y = to[1] + Math.sin(finishP * Math.PI) * 0.25;
        } else if (type === 'b') {
          const lungeP = Math.sin(finishP * Math.PI);
          groupRef.current.rotation.z = (color === 'w' ? -1 : 1) * lungeP * 0.5;
          groupRef.current.rotation.x = lungeP * 0.4;
          groupRef.current.position.y = to[1] + lungeP * 0.25;
        } else {
          const strikeP = Math.sin(finishP * Math.PI);
          groupRef.current.rotation.x = strikeP * 0.45;
        }
        return;
      }

      groupRef.current.position.set(to[0], to[1], to[2]);
      groupRef.current.rotation.set(0, 0, 0);
      return;
    }

    const targetVec = new THREE.Vector3(targetPos[0], targetPos[1], targetPos[2]);
    const horizontalDist = new THREE.Vector2(
      currentPos.current.x - targetVec.x,
      currentPos.current.z - targetVec.z
    ).length();

    const isMoving = horizontalDist > 0.05;
    const arcHeight = isMoving ? Math.sin(Math.min(1, horizontalDist) * Math.PI) * 0.45 : 0;
    const hoverHeight = isSelected ? 0.35 : 0;

    targetVec.y = targetPos[1] + arcHeight + hoverHeight;
    currentPos.current.lerp(targetVec, Math.min(1, delta * 12));
    groupRef.current.position.copy(currentPos.current);

    if (isSelected) {
      groupRef.current.rotation.y += delta * 1.8;
    } else {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, delta * 8);
    }
  });

  return (
    <group
      ref={groupRef}
      position={targetPos}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <PieceModelMesh3D
        type={type}
        color={color}
        materialProps={materialProps}
        isCombatAttacker={isAttackingInCombat}
        combatProgress={combatProgress}
      />

      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.45, 32]} />
          <meshBasicMaterial color="#d4af37" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};
