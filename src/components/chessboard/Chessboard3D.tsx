import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Square, PieceType, Color } from '../../types/chess';
import { useChessStore } from '../../stores/useChessStore';
import { BOARD_THEMES } from '../../constants/themes';
import { ChessPiece3D } from '../chess-pieces/ChessPiece3D';
import { CombatFx3D } from '../chess-pieces/CombatFx3D';
import { DyingPiece3D } from '../chess-pieces/DyingPiece3D';
import { sound } from '../../services/soundEngine';
import { Camera, Eye, Video } from 'lucide-react';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

function getCoordsFromSquare(square: Square, orientation: Color): [number, number, number] {
  const file = square[0];
  const rank = square[1];

  let fileIdx = FILES.indexOf(file);
  let rankIdx = 8 - parseInt(rank, 10);

  if (orientation === 'b') {
    fileIdx = 7 - fileIdx;
    rankIdx = 7 - rankIdx;
  }

  const x = fileIdx - 3.5;
  const z = rankIdx - 3.5;
  return [x, 0.1, z];
}

interface CameraControllerProps {
  cameraPreset: 'perspective' | 'topdown' | 'lowangle';
  controlsRef: React.RefObject<any>;
}

const CameraController: React.FC<CameraControllerProps> = ({ cameraPreset, controlsRef }) => {
  const { activeCombat, orientation } = useChessStore();
  const targetCamPos = useRef(new THREE.Vector3(0, 18.0, 20.0));
  const targetLookAt = useRef(new THREE.Vector3(0, 0.3, 0.2));
  const shakeRef = useRef(0);
  const prevCombatId = useRef<string | null>(null);

  useEffect(() => {
    if (activeCombat && activeCombat.id !== prevCombatId.current) {
      prevCombatId.current = activeCombat.id;
      shakeRef.current = 0.38;
    }
  }, [activeCombat]);

  useFrame(({ camera }, delta) => {
    const basePos = new THREE.Vector3(0, 18.0, 20.0);
    const baseLook = new THREE.Vector3(0, 0.3, 0.2);

    switch (cameraPreset) {
      case 'perspective':
        basePos.set(0, 18.0, 20.0);
        baseLook.set(0, 0.3, 0.2);
        break;
      case 'topdown':
        basePos.set(0, 24.0, 0.01);
        baseLook.set(0, 0, 0);
        break;
      case 'lowangle':
        // Grandmaster Broadcast Cinematic Perspective (calibrated for full unclipped piece & edge visibility)
        basePos.set(6.8, 15.5, 18.8);
        baseLook.set(0, 0.3, 0.2);
        break;
    }

    // Dynamic Live In-Board Battle Director: Centers on the Two-Box Duel Arena!
    if (activeCombat) {
      const [fx, , fz] = getCoordsFromSquare(activeCombat.fromSquare, orientation);
      const [bx, , bz] = getCoordsFromSquare(activeCombat.square, orientation);
      const midX = (fx + bx) / 2;
      const midZ = (fz + bz) / 2;
      targetLookAt.current.set(midX * 0.7, 0.5, midZ * 0.7 + 0.2);
      targetCamPos.current.set(midX * 0.4 + 5.5, 13.8, midZ * 0.4 + 15.8);
    } else {
      targetLookAt.current.copy(baseLook);
      targetCamPos.current.copy(basePos);
    }

    camera.position.lerp(targetCamPos.current, Math.min(1, delta * 4));

    // Visceral kinetic camera shudder on battlefield captures
    if (shakeRef.current > 0.002) {
      camera.position.x += (Math.random() - 0.5) * shakeRef.current;
      camera.position.y += (Math.random() - 0.5) * shakeRef.current;
      shakeRef.current *= Math.pow(0.04, delta);
    }

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, Math.min(1, delta * 4));
      controlsRef.current.update();
    }
  });

  return null;
};

interface Board3DSceneProps {
  cameraPreset: 'perspective' | 'topdown' | 'lowangle';
  combatProgress: number | null;
  setCombatProgress: (p: number | null) => void;
}

const Board3DScene: React.FC<Board3DSceneProps> = ({
  cameraPreset,
  combatProgress,
  setCombatProgress,
}) => {
  const controlsRef = useRef<any>(null);
  const parryAudioRef = useRef(false);
  const finisherAudioRef = useRef(false);

  const {
    game,
    selectedSquare,
    legalMoves,
    lastMove,
    boardTheme,
    orientation,
    selectSquare,
    status,
    turn,
    activeCombat,
    clearActiveCombat,
  } = useChessStore();

  // 2.25s Cinematic In-Board Two-Box Battle Animation Loop
  useEffect(() => {
    if (!activeCombat) {
      setCombatProgress(null);
      parryAudioRef.current = false;
      finisherAudioRef.current = false;
      return;
    }

    parryAudioRef.current = false;
    finisherAudioRef.current = false;
    const startTime = performance.now();
    const duration = 2250;

    let animId: number;
    const step = (now: number) => {
      const elapsed = now - startTime;
      const p = Math.min(1, elapsed / duration);
      setCombatProgress(p);

      // Frame-synchronized live acoustic recordings
      if (p >= 0.28 && !parryAudioRef.current) {
        parryAudioRef.current = true;
        sound.playCombatParry();
      }
      if (p >= 0.58 && !finisherAudioRef.current) {
        finisherAudioRef.current = true;
        sound.playCombatFinisher(activeCombat.attackerType, activeCombat.victimType);
      }

      if (p < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setCombatProgress(null);
        clearActiveCombat();
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [activeCombat, clearActiveCombat, setCombatProgress]);

  const theme = BOARD_THEMES[boardTheme];
  const board = game.board();

  let checkSquare: Square | null = null;
  if (status === 'check' || status === 'checkmate') {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === turn) {
          checkSquare = `${FILES[c]}${8 - r}` as Square;
          break;
        }
      }
      if (checkSquare) break;
    }
  }

  return (
    <>
      <CameraController cameraPreset={cameraPreset} controlsRef={controlsRef} />

      <ambientLight intensity={0.65} />
      
      {/* Primary Key Light */}
      <directionalLight
        position={[8, 16, 8]}
        intensity={1.35}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-camera-near={0.5}
        shadow-camera-far={36}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      {/* Warm Golden Specular Rim Light */}
      <directionalLight position={[-8, 9, -8]} intensity={0.65} color="#ffe4b5" />

      {/* Cool Ambient Fill */}
      <directionalLight position={[0, 12, -6]} intensity={0.35} color="#e2e8f0" />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[0, 0.4, 0.4]}
        enablePan={false}
        minPolarAngle={Math.PI / 14}
        maxPolarAngle={Math.PI / 2.3}
        minDistance={10}
        maxDistance={30}
        dampingFactor={0.06}
      />

      {/* Tier 1: Plinth Base */}
      <mesh position={[0, -0.22, 0]} receiveShadow>
        <boxGeometry args={[9.4, 0.44, 9.4]} />
        <meshStandardMaterial
          color={theme.borderColor}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>

      {/* Tier 2: Brass Inlay Trim */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[8.6, 0.06, 8.6]} />
        <meshStandardMaterial
          color="#d4af37"
          roughness={0.15}
          metalness={0.88}
        />
      </mesh>

      {/* Tier 3: Inner Plinth Frame */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[8.3, 0.04, 8.3]} />
        <meshStandardMaterial
          color={theme.borderColor}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* 8x8 Board Squares */}
      {RANKS.map((rank, rIdx) =>
        FILES.map((file, fIdx) => {
          const square = `${file}${rank}` as Square;
          const isLight = (rIdx + fIdx) % 2 === 0;

          let displayFileIdx = fIdx;
          let displayRankIdx = rIdx;
          if (orientation === 'b') {
            displayFileIdx = 7 - fIdx;
            displayRankIdx = 7 - rIdx;
          }

          const x = displayFileIdx - 3.5;
          const z = displayRankIdx - 3.5;

          const isSelected = selectedSquare === square;
          const isLegal = legalMoves.includes(square);
          const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
          const isCheckKing = checkSquare === square;

          let squareColor = isLight ? theme.lightSquare3D : theme.darkSquare3D;
          if (isSelected) squareColor = '#d4af37';
          else if (isLastMove) squareColor = isLight ? '#f2e8be' : '#69512c';

          return (
            <group key={square} position={[x, 0.08, z]}>
              <mesh
                receiveShadow
                onClick={(e) => {
                  e.stopPropagation();
                  selectSquare(square);
                }}
              >
                <boxGeometry args={[0.96, 0.06, 0.96]} />
                <meshStandardMaterial
                  color={squareColor}
                  roughness={isLight ? 0.2 : 0.3}
                  metalness={0.08}
                />
              </mesh>

              {/* Legal Move Glowing Target Disc */}
              {isLegal && (
                <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.15, 0.26, 32]} />
                  <meshBasicMaterial color="#d4af37" transparent opacity={0.85} />
                </mesh>
              )}

              {/* King in Check Pulsing Crimson Halo */}
              {isCheckKing && (
                <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.28, 0.44, 32]} />
                  <meshBasicMaterial color="#ef4444" transparent opacity={0.9} />
                </mesh>
              )}
            </group>
          );
        })
      )}

      {/* 3D Chess Pieces */}
      {board.map((row, r) =>
        row.map((piece, c) => {
          if (!piece) return null;
          const square = `${FILES[c]}${8 - r}` as Square;
          const targetPos = getCoordsFromSquare(square, orientation);
          const isSelected = selectedSquare === square;
          const isAttacking = activeCombat?.square === square;
          const combatFromPos =
            isAttacking && activeCombat?.fromSquare
              ? getCoordsFromSquare(activeCombat.fromSquare, orientation)
              : undefined;

          return (
            <ChessPiece3D
              key={`${piece.color}-${piece.type}-${square}`}
              type={piece.type as PieceType}
              color={piece.color as Color}
              targetPos={targetPos}
              combatFromPos={combatFromPos}
              isSelected={isSelected}
              onClick={() => selectSquare(square)}
              isAttackingInCombat={isAttacking}
              combatProgress={isAttacking ? combatProgress : null}
            />
          );
        })
      )}

      {/* 1. Defeated Combatant Ghost Piece Dying on Square */}
      {activeCombat && combatProgress !== null && (
        <DyingPiece3D
          key={`dying-${activeCombat.id}`}
          type={activeCombat.victimType}
          color={activeCombat.victimColor}
          attackerType={activeCombat.attackerType}
          targetPos={getCoordsFromSquare(activeCombat.square, orientation)}
          progress={combatProgress}
        />
      )}

      {/* 2. In-Board Physical 3D Shockwave, Dust & Sparks */}
      {activeCombat && combatProgress !== null && (
        <CombatFx3D
          key={`fx-${activeCombat.id}`}
          position={getCoordsFromSquare(activeCombat.square, orientation)}
          fromPosition={
            activeCombat.fromSquare
              ? getCoordsFromSquare(activeCombat.fromSquare, orientation)
              : undefined
          }
          attackerType={activeCombat.attackerType}
          victimType={activeCombat.victimType}
          progress={combatProgress}
        />
      )}

      {/* Ground Contact Shadow */}
      <ContactShadows
        position={[0, -0.45, 0]}
        opacity={0.75}
        scale={16}
        blur={1.8}
        far={7}
      />
    </>
  );
};

export const Chessboard3D: React.FC = () => {
  const [cameraPreset, setCameraPreset] = useState<'perspective' | 'topdown' | 'lowangle'>(
    'perspective'
  );
  const [combatProgress, setCombatProgress] = useState<number | null>(null);
  const { activeCombat } = useChessStore();

  return (
    <div className="relative aspect-square w-[min(92vw,calc(100vh-170px),720px)] h-[min(92vw,calc(100vh-170px),720px)] xl:w-[min(92vw,calc(100vh-160px),760px)] xl:h-[min(92vw,calc(100vh-160px),760px)] 2xl:w-[min(92vw,calc(100vh-150px),800px)] 2xl:h-[min(92vw,calc(100vh-150px),800px)] rounded-2xl overflow-hidden shadow-luxury border border-amber-900/50 bg-gradient-to-b from-[#12141a] to-[#0a0b0e]">
      {/* 3D Cinematic Floating Action Badge */}
      {activeCombat && combatProgress !== null && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-200">
          {combatProgress >= 0.25 && combatProgress < 0.55 && (
            <div className="px-4 py-1.5 rounded-full bg-black/85 border border-amber-400 text-amber-300 text-xs sm:text-sm font-bold tracking-widest shadow-[0_0_24px_rgba(245,158,11,0.85)] animate-bounce flex items-center gap-2">
              <span>⚔️</span>
              <span>3D MARTIAL SKILL CLASH!</span>
            </div>
          )}
          {combatProgress >= 0.55 && combatProgress < 0.85 && (
            <div className="px-4 py-1.5 rounded-full bg-black/90 border border-red-500 text-red-300 text-xs sm:text-sm font-bold tracking-widest shadow-[0_0_28px_rgba(239,68,68,0.95)] animate-pulse flex items-center gap-2">
              <span>💥</span>
              <span>GUARD BROKEN — LETHAL FINISHER!</span>
            </div>
          )}
        </div>
      )}

      <Suspense
        fallback={
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-stone-400">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono font-semibold tracking-wider text-amber-300">
              Rendering 3D Staunton Stage...
            </span>
          </div>
        }
      >
        <Canvas
          shadows
          camera={{ position: [0, 18.0, 20.0], fov: 40 }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <Board3DScene
            cameraPreset={cameraPreset}
            combatProgress={combatProgress}
            setCombatProgress={setCombatProgress}
          />
        </Canvas>
      </Suspense>

      {/* Camera Presets Switcher */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 p-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 shadow-lg">
        <button
          onClick={() => setCameraPreset('perspective')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-colors ${
            cameraPreset === 'perspective'
              ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          title="3D Perspective"
        >
          <Camera className="w-3 h-3" />
          <span>3D</span>
        </button>

        <button
          onClick={() => setCameraPreset('topdown')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-colors ${
            cameraPreset === 'topdown'
              ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          title="Top-Down View"
        >
          <Eye className="w-3 h-3" />
          <span>Top</span>
        </button>

        <button
          onClick={() => setCameraPreset('lowangle')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-colors ${
            cameraPreset === 'lowangle'
              ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          title="Grandmaster 3/4 Cinematic Angle"
        >
          <Video className="w-3 h-3" />
          <span>Cinematic</span>
        </button>
      </div>

      <div className="absolute bottom-2.5 left-2.5 pointer-events-none text-[9px] sm:text-[10px] font-mono text-amber-200/50 bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/5">
        Orbit: Drag · Zoom: Scroll
      </div>
    </div>
  );
};
