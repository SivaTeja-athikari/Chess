import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PieceType, Color } from '../../types/chess';
import { PieceModelMesh3D } from './ChessPiece3D';

interface DyingPiece3DProps {
  type: PieceType;
  color: Color;
  attackerType: PieceType;
  targetPos: [number, number, number];
  progress: number; // 0 to 1
}

export const DyingPiece3D: React.FC<DyingPiece3DProps> = ({
  type,
  color,
  attackerType,
  targetPos,
  progress,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const isWhite = color === 'w';

  const materialProps = useMemo(() => {
    const fade = progress > 0.72 ? Math.max(0, 1 - (progress - 0.72) / 0.28) : 1;
    if (isWhite) {
      return {
        color: '#f5f3ec',
        roughness: 0.16,
        metalness: 0.05,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15,
        transparent: fade < 1,
        opacity: fade,
      };
    } else {
      return {
        color: '#151922',
        roughness: 0.24,
        metalness: 0.28,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
        transparent: fade < 1,
        opacity: fade,
      };
    }
  }, [isWhite, progress]);

  useFrame(() => {
    if (!groupRef.current) return;

    // Stage 1 & 2: Facing Attacker & Parrying Blows (0 to 0.55)
    if (progress < 0.25) {
      groupRef.current.position.set(targetPos[0], targetPos[1], targetPos[2]);
      groupRef.current.scale.set(1, 1, 1);
      groupRef.current.rotation.set(0, 0, 0);
      return;
    }

    if (progress >= 0.25 && progress < 0.55) {
      const parryP = (progress - 0.25) / 0.3;
      // Wobble in martial parry resistance
      const wobble = Math.sin(parryP * Math.PI * 4) * 0.12;
      groupRef.current.position.set(
        targetPos[0] + wobble * 0.5,
        targetPos[1],
        targetPos[2] + wobble * 0.5
      );
      groupRef.current.rotation.set(wobble, 0, -wobble);
      return;
    }

    // Stage 3: Guard Broken & Lethal Impact (0.55 to 0.85)
    if (attackerType === 'r') {
      // Pulverized / Crushed Flat by War Elephant Stomp
      const crushProg = Math.min(1, (progress - 0.55) / 0.2);
      const squashedY = THREE.MathUtils.lerp(1.0, 0.06, crushProg);
      const squashedXZ = THREE.MathUtils.lerp(1.0, 1.6, crushProg);
      groupRef.current.scale.set(squashedXZ, squashedY, squashedXZ);
      groupRef.current.position.set(targetPos[0], targetPos[1], targetPos[2]);

      if (progress > 0.75) {
        const fadeProg = (progress - 0.75) / 0.25;
        groupRef.current.position.y = targetPos[1] - fadeProg * 0.2;
        groupRef.current.scale.multiplyScalar(Math.max(0.01, 1 - fadeProg));
      }
    } else if (attackerType === 'n') {
      // Kicked Flying Backward by Warhorse Hooves
      const flyProg = Math.min(1, (progress - 0.55) / 0.35);
      const flyArcY = Math.sin(flyProg * Math.PI) * 1.1;
      const knockZ = flyProg * (isWhite ? 1.4 : -1.4);
      groupRef.current.position.set(targetPos[0], targetPos[1] + flyArcY, targetPos[2] + knockZ);
      groupRef.current.rotation.set(flyProg * Math.PI * 2, flyProg * Math.PI, 0);
      groupRef.current.scale.setScalar(Math.max(0.01, 1 - flyProg * 0.9));
    } else if (attackerType === 'k') {
      // Vaporized by Imperial King Celestial Lightning
      const vaporProg = Math.min(1, (progress - 0.55) / 0.35);
      groupRef.current.scale.set(
        Math.max(0.01, 1 - vaporProg * 0.95),
        Math.max(0.01, 1 + vaporProg * 0.5),
        Math.max(0.01, 1 - vaporProg * 0.95)
      );
      groupRef.current.position.y = targetPos[1] + vaporProg * 0.4;
      groupRef.current.rotation.y = vaporProg * Math.PI * 4;
    } else {
      // Cleaved by Soldier Sword / Desert Camel Scimitar / Queen Cyclone
      const staggerProg = Math.min(1, (progress - 0.55) / 0.3);
      groupRef.current.rotation.x = staggerProg * (Math.PI / 2);
      groupRef.current.position.set(
        targetPos[0],
        targetPos[1] + Math.sin(staggerProg * Math.PI * 0.5) * 0.12,
        targetPos[2] + (isWhite ? staggerProg * 0.4 : -staggerProg * 0.4)
      );

      // Dissolve into particles / smoke
      if (progress > 0.72) {
        const dissolveProg = (progress - 0.72) / 0.28;
        groupRef.current.scale.setScalar(Math.max(0.01, 1 - dissolveProg));
      }
    }
  });

  return (
    <group ref={groupRef} position={targetPos}>
      <PieceModelMesh3D type={type} color={color} materialProps={materialProps} />
    </group>
  );
};
