import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieceType, Color, Square } from '../../types/chess';
import { ChessPiece2D } from './ChessPiece2D';
import { sound } from '../../services/soundEngine';

export interface LivingPieceMorph2DProps {
  attackerType: PieceType;
  attackerColor: Color;
  victimType: PieceType;
  victimColor: Color;
  fromSquare: Square;
  toSquare: Square;
  orientation: Color;
  onFinished: () => void;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

function getSquareCoords(sq: Square, orientation: Color) {
  const file = sq[0];
  const rank = sq[1];
  let fileIdx = FILES.indexOf(file);
  let rankIdx = 8 - parseInt(rank, 10);
  if (orientation === 'b') {
    fileIdx = 7 - fileIdx;
    rankIdx = 7 - rankIdx;
  }
  return {
    fileIdx,
    rankIdx,
    pctX: fileIdx * 12.5,
    pctY: rankIdx * 12.5,
    centerPctX: (fileIdx + 0.5) * 12.5,
    centerPctY: (rankIdx + 0.5) * 12.5,
  };
}

// -------------------------------------------------------------
// 1. Human Warrior (Pawn - Spartan / Legionnaire Soldier)
// -------------------------------------------------------------
const HumanWarriorSVG: React.FC<{
  color: Color;
  actionState: 'idle' | 'charging' | 'strike' | 'parry' | 'finisher' | 'stagger' | 'dying';
}> = ({ color, actionState }) => {
  const isWhite = color === 'w';
  const armorColor = isWhite ? '#f8fafc' : '#1e293b';
  const trimColor = isWhite ? '#f59e0b' : '#ef4444';
  const bladeColor = isWhite ? '#38bdf8' : '#f87171';

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.85)] overflow-visible">
      {/* Transmutation Aura Ring */}
      <circle cx="50" cy="50" r="46" fill="none" stroke={trimColor} strokeWidth="1.6" strokeDasharray="6 3" opacity="0.6" className="animate-spin" />

      {/* Armored Legs */}
      <path d="M42 66 L34 94 L44 94 L48 68 Z" fill={armorColor} stroke="#0f172a" strokeWidth="1.2" />
      <path d="M52 66 L62 94 L52 94 L48 68 Z" fill={armorColor} stroke="#0f172a" strokeWidth="1.2" />

      {/* Torso & Cuirass Breastplate */}
      <path d="M36 38 L64 38 L58 68 L42 68 Z" fill={armorColor} stroke="#0f172a" strokeWidth="1.5" />
      <path d="M44 42 L50 56 L56 42 L50 48 Z" fill={trimColor} />

      {/* Pauldrons (Shoulder Armor) */}
      <circle cx="34" cy="40" r="8" fill={trimColor} stroke="#0f172a" strokeWidth="1" />
      <circle cx="66" cy="40" r="8" fill={trimColor} stroke="#0f172a" strokeWidth="1" />

      {/* Crested Spartan / Legionnaire Helmet */}
      <ellipse cx="50" cy="26" rx="11" ry="13" fill={armorColor} stroke="#0f172a" strokeWidth="1.5" />
      <rect x="43" y="25" width="14" height="3" rx="1.5" fill={isWhite ? '#67e8f9' : '#f87171'} />
      <path d="M48 6 Q50 0 52 6 L55 20 L45 20 Z" fill={trimColor} />

      {/* Left Arm: Hoplite Shield (Raises in parry / stance) */}
      <motion.g
        animate={
          actionState === 'parry'
            ? { x: [0, 8, 4], scale: [1, 1.25, 1.15] }
            : actionState === 'stagger'
            ? { x: -14, rotate: -35 }
            : {}
        }
        transition={{ duration: 0.25 }}
        style={{ originX: '30px', originY: '54px' }}
      >
        <ellipse cx="30" cy="54" rx="14" ry="17" fill={armorColor} stroke={trimColor} strokeWidth="2.8" />
        <circle cx="30" cy="54" r="5" fill={trimColor} />
      </motion.g>

      {/* Right Arm: Broadsword with Glowing Energy Edge */}
      <motion.g
        animate={
          actionState === 'strike'
            ? { rotate: [0, -40, 60, 0], x: [0, -4, 18, 0], y: [0, -6, 6, 0] }
            : actionState === 'finisher'
            ? { rotate: [0, -75, 75, 0], scale: [1, 1.35, 1], y: [0, -18, 12, 0] }
            : actionState === 'stagger'
            ? { rotate: 45, x: 12, y: 10 }
            : {}
        }
        transition={{ duration: 0.38, ease: 'easeInOut' }}
        style={{ originX: '66px', originY: '40px' }}
      >
        <rect x="64" y="38" width="7" height="18" rx="3.5" fill={armorColor} />
        <rect x="62" y="28" width="20" height="5" rx="2.5" fill={trimColor} />
        <polygon points="72,28 68,-14 76,-14 72,-24" fill="#f1f5f9" stroke={bladeColor} strokeWidth="1.8" />
        <line x1="72" y1="26" x2="72" y2="-20" stroke={bladeColor} strokeWidth="2.2" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
};

// -------------------------------------------------------------
// 2. War Elephant (Rook / Gaja)
// -------------------------------------------------------------
const WarElephantSVG: React.FC<{
  color: Color;
  actionState: 'idle' | 'charging' | 'strike' | 'parry' | 'finisher' | 'stagger' | 'dying';
}> = ({ color, actionState }) => {
  const isWhite = color === 'w';
  const skinColor = isWhite ? '#e2e8f0' : '#334155';
  const armorColor = isWhite ? '#d4af37' : '#991b1b';
  const tuskColor = '#fef3c7';

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.9)] overflow-visible">
      {/* Heavy Front Legs */}
      <motion.rect
        x="22"
        y="56"
        width="16"
        height="38"
        rx="5"
        fill={skinColor}
        stroke="#0f172a"
        strokeWidth="1.8"
        animate={actionState === 'finisher' ? { y: [56, 32, 62, 56] } : {}}
        transition={{ duration: 0.55 }}
      />
      <motion.rect
        x="62"
        y="56"
        width="16"
        height="38"
        rx="5"
        fill={skinColor}
        stroke="#0f172a"
        strokeWidth="1.8"
        animate={actionState === 'finisher' ? { y: [56, 32, 62, 56] } : {}}
        transition={{ duration: 0.55 }}
      />

      {/* Elephant Body */}
      <ellipse cx="50" cy="52" rx="36" ry="28" fill={skinColor} stroke="#0f172a" strokeWidth="1.8" />

      {/* Saddle Blanket */}
      <path d="M24 40 Q50 32 76 40 L72 68 Q50 64 28 68 Z" fill={armorColor} stroke="#0f172a" strokeWidth="1.5" />
      <circle cx="50" cy="52" r="5" fill="#fef08a" />

      {/* Howdah Castle */}
      <rect x="38" y="16" width="24" height="18" rx="2" fill={armorColor} stroke="#0f172a" strokeWidth="1.5" />
      <polygon points="38,16 42,10 48,16 52,10 58,16 62,10" fill="#fef08a" />

      {/* Head with Plate Armor */}
      <circle cx="50" cy="38" r="22" fill={skinColor} stroke="#0f172a" strokeWidth="1.8" />
      <polygon points="50,20 64,34 50,48 36,34" fill={armorColor} stroke="#0f172a" strokeWidth="1.5" />
      <circle cx="50" cy="34" r="3.5" fill="#fef08a" />

      {/* Ears */}
      <path d="M30 24 C16 26 12 48 26 54 Z" fill={skinColor} stroke="#0f172a" strokeWidth="1.5" />
      <path d="M70 24 C84 26 88 48 74 54 Z" fill={skinColor} stroke="#0f172a" strokeWidth="1.5" />

      {/* Curved Tusks */}
      <motion.g
        animate={
          actionState === 'strike'
            ? { y: [-2, 8, 0], scale: [1, 1.15, 1] }
            : actionState === 'finisher'
            ? { y: [-6, 14, 0], scale: [1, 1.3, 1] }
            : {}
        }
        transition={{ duration: 0.4 }}
      >
        <path d="M36 46 Q24 56 18 68 Q24 65 38 52 Z" fill={tuskColor} stroke="#ca8a04" strokeWidth="1.2" />
        <path d="M64 46 Q76 56 82 68 Q76 65 62 52 Z" fill={tuskColor} stroke="#ca8a04" strokeWidth="1.2" />
        <circle cx="18" cy="68" r="3" fill={armorColor} />
        <circle cx="82" cy="68" r="3" fill={armorColor} />
      </motion.g>

      {/* Armored Trunk Roaring */}
      <motion.path
        d="M47 44 Q50 58 50 70 Q54 78 62 74"
        fill="none"
        stroke={skinColor}
        strokeWidth="9"
        strokeLinecap="round"
        animate={
          actionState === 'finisher' || actionState === 'strike'
            ? { d: ['M47 44 Q50 58 50 70 Q54 78 62 74', 'M47 44 Q40 24 50 8 Q62 2 72 8', 'M47 44 Q50 58 50 70 Q54 78 62 74'] }
            : {}
        }
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
    </svg>
  );
};

// -------------------------------------------------------------
// 3. Desert War Camel (Bishop / Ushtra)
// -------------------------------------------------------------
const WarCamelSVG: React.FC<{
  color: Color;
  actionState: 'idle' | 'charging' | 'strike' | 'parry' | 'finisher' | 'stagger' | 'dying';
}> = ({ color, actionState }) => {
  const isWhite = color === 'w';
  const camelColor = isWhite ? '#fde68a' : '#78350f';
  const saddleColor = isWhite ? '#0284c7' : '#991b1b';

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.75)] overflow-visible">
      {/* Camel Four Long Legs */}
      <line x1="30" y1="60" x2="26" y2="94" stroke={camelColor} strokeWidth="5" strokeLinecap="round" />
      <line x1="42" y1="62" x2="40" y2="94" stroke={camelColor} strokeWidth="5" strokeLinecap="round" />
      <line x1="60" y1="62" x2="58" y2="94" stroke={camelColor} strokeWidth="5" strokeLinecap="round" />
      <line x1="72" y1="60" x2="76" y2="94" stroke={camelColor} strokeWidth="5" strokeLinecap="round" />

      {/* Body & Hump */}
      <ellipse cx="50" cy="56" rx="28" ry="18" fill={camelColor} stroke="#0f172a" strokeWidth="1.5" />
      <circle cx="48" cy="38" r="15" fill={camelColor} stroke="#0f172a" strokeWidth="1.5" />

      {/* Saddle */}
      <path d="M38 44 Q50 38 62 44 L60 64 Q50 68 40 64 Z" fill={saddleColor} />
      <circle cx="50" cy="54" r="3.5" fill="#facc15" />

      {/* S-Curved Neck & Head */}
      <path d="M64 54 Q78 48 76 28 Q75 16 86 16" fill="none" stroke={camelColor} strokeWidth="9" strokeLinecap="round" />
      <ellipse cx="88" cy="16" rx="8" ry="5.5" fill={camelColor} stroke="#0f172a" strokeWidth="1.2" />
      <circle cx="86" cy="14" r="1.5" fill="#0f172a" />
      <line x1="82" y1="18" x2="68" y2="34" stroke="#facc15" strokeWidth="1.8" />

      {/* Damascus Scimitars */}
      <motion.g
        animate={
          actionState === 'strike'
            ? { rotate: [0, -35, 50, 0], x: [0, -4, 14, 0] }
            : actionState === 'finisher'
            ? { rotate: [0, 360], scale: [1, 1.3, 1] }
            : actionState === 'parry'
            ? { rotate: -25, x: -6 }
            : {}
        }
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        style={{ originX: '50px', originY: '46px' }}
      >
        <path d="M46 44 Q36 28 22 22 Q30 32 44 48 Z" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
        <rect x="42" y="44" width="8" height="4" rx="2" fill="#d4af37" />
        <path d="M54 44 Q64 28 78 22 Q70 32 56 48 Z" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
      </motion.g>
    </svg>
  );
};

// -------------------------------------------------------------
// 4. Armored Warhorse (Knight / Ashwa)
// -------------------------------------------------------------
const WarhorseSVG: React.FC<{
  color: Color;
  actionState: 'idle' | 'charging' | 'strike' | 'parry' | 'finisher' | 'stagger' | 'dying';
}> = ({ color, actionState }) => {
  const isWhite = color === 'w';
  const horseColor = isWhite ? '#f8fafc' : '#1e293b';
  const bardingColor = isWhite ? '#d4af37' : '#991b1b';

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.8)] overflow-visible">
      {/* Hind Legs */}
      <path d="M28 68 L20 94 L30 94 L36 72 Z" fill={horseColor} stroke="#0f172a" strokeWidth="1.5" />

      {/* Rearing Front Hooves */}
      <motion.g
        animate={
          actionState === 'strike'
            ? { y: [0, -14, 6, 0], rotate: [0, -20, 25, 0] }
            : actionState === 'finisher'
            ? { y: [0, -26, 14, 0], rotate: [0, -35, 45, 0], scale: [1, 1.25, 1] }
            : {}
        }
        transition={{ duration: 0.45 }}
        style={{ originX: '45px', originY: '55px' }}
      >
        <path d="M46 54 L62 38 L68 44 L50 62 Z" fill={horseColor} stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="66" cy="40" r="4.5" fill={bardingColor} />
      </motion.g>

      {/* Muscular Stallion Body */}
      <ellipse cx="44" cy="62" rx="26" ry="18" fill={horseColor} stroke="#0f172a" strokeWidth="1.8" />
      <path d="M34 52 Q50 48 64 56 L60 72 Q46 68 32 70 Z" fill={bardingColor} stroke="#0f172a" strokeWidth="1.5" />

      {/* Arched Neck & Warhorse Head */}
      <path d="M50 56 Q66 42 64 24 Q62 14 74 14" fill="none" stroke={horseColor} strokeWidth="13" strokeLinecap="round" />
      <polygon points="72,12 86,18 78,28 66,22" fill={horseColor} stroke="#0f172a" strokeWidth="1.5" />
      <polygon points="68,16 80,4 74,18" fill={bardingColor} />
      <polygon points="62,14 66,4 70,12" fill={horseColor} />
      <path d="M58 44 Q66 32 68 18" fill="none" stroke={bardingColor} strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
};

// -------------------------------------------------------------
// 5. Winged Valkyrie Empress (Queen)
// -------------------------------------------------------------
const ValkyrieQueenSVG: React.FC<{
  color: Color;
  actionState: 'idle' | 'charging' | 'strike' | 'parry' | 'finisher' | 'stagger' | 'dying';
}> = ({ color, actionState }) => {
  const isWhite = color === 'w';
  const dressColor = isWhite ? '#f8fafc' : '#1e1b4b';
  const goldColor = '#f59e0b';

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_6px_20px_rgba(245,158,11,0.75)] overflow-visible">
      {/* Radiant Wings of Light */}
      <motion.g
        animate={
          actionState === 'finisher'
            ? { scale: [1, 1.4, 1.1], rotate: [0, 15, -15, 0] }
            : actionState === 'strike'
            ? { scale: [1, 1.2, 1] }
            : {}
        }
        transition={{ duration: 0.5 }}
      >
        <path d="M50 48 Q16 16 4 36 Q20 58 46 54 Z" fill="url(#valkGoldQueen)" opacity="0.9" />
        <path d="M50 48 Q84 16 96 36 Q80 58 54 54 Z" fill="url(#valkGoldQueen)" opacity="0.9" />
      </motion.g>

      <defs>
        <linearGradient id="valkGoldQueen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* Royal Gown */}
      <path d="M40 40 L60 40 L68 92 L32 92 Z" fill={dressColor} stroke="#0f172a" strokeWidth="1.5" />
      <circle cx="50" cy="26" r="10" fill={dressColor} stroke="#0f172a" strokeWidth="1.2" />
      <polygon points="40,20 45,10 50,16 55,10 60,20" fill={goldColor} stroke="#0f172a" strokeWidth="1.2" />

      {/* Dual Curved Rapiers in Cyclone */}
      <motion.g
        animate={
          actionState === 'finisher'
            ? { rotate: [0, 720], scale: [1, 1.35, 1] }
            : actionState === 'strike'
            ? { rotate: [0, 90, 0] }
            : {}
        }
        transition={{ duration: 0.55, ease: 'easeInOut' }}
        style={{ originX: '50px', originY: '50px' }}
      >
        <line x1="24" y1="16" x2="76" y2="84" stroke={goldColor} strokeWidth="3.5" strokeLinecap="round" />
        <line x1="76" y1="16" x2="24" y2="84" stroke={goldColor} strokeWidth="3.5" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
};

// -------------------------------------------------------------
// 6. Imperial Sovereign Monarch (King)
// -------------------------------------------------------------
const ImperialKingSVG: React.FC<{
  color: Color;
  actionState: 'idle' | 'charging' | 'strike' | 'parry' | 'finisher' | 'stagger' | 'dying';
}> = ({ color, actionState }) => {
  const isWhite = color === 'w';
  const robeColor = isWhite ? '#f8fafc' : '#0f172a';
  const mantleColor = isWhite ? '#b91c1c' : '#581c87';
  const goldColor = '#f59e0b';

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_24px_rgba(245,158,11,0.85)] overflow-visible">
      <path d="M26 38 Q50 32 74 38 L82 92 L18 92 Z" fill={mantleColor} stroke="#0f172a" strokeWidth="1.5" />
      <path d="M38 38 L62 38 L66 92 L34 92 Z" fill={robeColor} stroke="#0f172a" strokeWidth="1.5" />
      <line x1="50" y1="38" x2="50" y2="92" stroke={goldColor} strokeWidth="3" />
      <circle cx="50" cy="26" r="11" fill={robeColor} stroke="#0f172a" strokeWidth="1.5" />
      <polygon points="36,18 42,6 50,14 58,6 64,18" fill={goldColor} stroke="#0f172a" strokeWidth="1.5" />
      <circle cx="50" cy="6" r="2.5" fill="#fef08a" />

      {/* Greatsword Judgment */}
      <motion.g
        animate={
          actionState === 'finisher'
            ? { y: [0, -22, 16, 0], scale: [1, 1.35, 1.1, 1], rotate: [0, -20, 25, 0] }
            : actionState === 'strike'
            ? { y: [0, -10, 10, 0] }
            : {}
        }
        transition={{ duration: 0.55, ease: 'easeInOut' }}
        style={{ originX: '50px', originY: '30px' }}
      >
        <polygon points="50,-24 44,24 56,24" fill="#f1f5f9" stroke="#38bdf8" strokeWidth="2" />
        <rect x="36" y="24" width="28" height="6" rx="3" fill={goldColor} stroke="#0f172a" strokeWidth="1" />
        <rect x="47" y="30" width="6" height="12" rx="2" fill={goldColor} />
        <polygon points="50,42 54,46 50,50 46,46" fill="#fef08a" />
      </motion.g>
    </svg>
  );
};

// Helper to render any creature
function renderLivingCreature(
  type: PieceType,
  color: Color,
  state: 'idle' | 'charging' | 'strike' | 'parry' | 'finisher' | 'stagger' | 'dying'
) {
  switch (type) {
    case 'p':
      return <HumanWarriorSVG color={color} actionState={state} />;
    case 'r':
      return <WarElephantSVG color={color} actionState={state} />;
    case 'b':
      return <WarCamelSVG color={color} actionState={state} />;
    case 'n':
      return <WarhorseSVG color={color} actionState={state} />;
    case 'q':
      return <ValkyrieQueenSVG color={color} actionState={state} />;
    case 'k':
      return <ImperialKingSVG color={color} actionState={state} />;
    default:
      return <HumanWarriorSVG color={color} actionState={state} />;
  }
}

// -------------------------------------------------------------
// Main Two-Box Cinematic Duel System
// -------------------------------------------------------------
export const LivingPieceMorph2D: React.FC<LivingPieceMorph2DProps> = ({
  attackerType,
  attackerColor,
  victimType,
  victimColor,
  fromSquare,
  toSquare,
  orientation,
  onFinished,
}) => {
  // Acts:
  // Act 1: 'transmute' (0 - 450ms) -> Both boxes glow, transform into living warriors, attacker charges
  // Act 2: 'clash' (450 - 1100ms) -> Skill strike 1 & metal parry, spark explosion, defender counter
  // Act 3: 'finisher' (1100 - 1800ms) -> Guard broken, lethal finisher with authentic roar/sound, victim demise
  // Act 4: 'victory' (1800 - 2250ms) -> Attacker celebrates on toSquare and transmutes into Staunton piece
  const [act, setAct] = useState<'transmute' | 'clash' | 'finisher' | 'victory'>('transmute');
  const [clashSubPhase, setClashSubPhase] = useState<'strike1' | 'counter2'>('strike1');
  const [showImpactFlash, setShowImpactFlash] = useState(false);
  const [combatText, setCombatText] = useState<string | null>(null);

  const fromCoords = useMemo(() => getSquareCoords(fromSquare, orientation), [fromSquare, orientation]);
  const toCoords = useMemo(() => getSquareCoords(toSquare, orientation), [toSquare, orientation]);

  // Delta vector between the two boxes in board percentages
  const deltaX = toCoords.pctX - fromCoords.pctX;
  const deltaY = toCoords.pctY - fromCoords.pctY;

  // Midpoint clash contact point (close to the defender)
  const clashX = deltaX * 0.72;
  const clashY = deltaY * 0.72;

  useEffect(() => {
    // Act 2: Martial Skill Exchange & Weapon Parry (at 450ms)
    const tClash = setTimeout(() => {
      setAct('clash');
      setClashSubPhase('strike1');
      sound.playCombatParry(); // Real steel clash audio!
      setCombatText('⚔️ SKILL CLASH!');
    }, 450);

    // Defender counter-blow (at 800ms)
    const tCounter = setTimeout(() => {
      setClashSubPhase('counter2');
      sound.playCombatParry();
      setCombatText('🛡️ PARRY & DEFLECT!');
    }, 800);

    // Act 3: Guard Broken & Lethal Finisher (at 1150ms)
    const tFinisher = setTimeout(() => {
      setAct('finisher');
      setShowImpactFlash(true);
      setCombatText('💥 GUARD BROKEN — LETHAL FINISHER!');
      sound.playCombatFinisher(attackerType, victimType); // Real animal/human audio!

      setTimeout(() => setShowImpactFlash(false), 160);
    }, 1150);

    // Act 4: Victory Settle & Staunton Transmutation (at 1800ms)
    const tVictory = setTimeout(() => {
      setAct('victory');
      setCombatText(null);
    }, 1800);

    // Completion (at 2250ms)
    const tEnd = setTimeout(() => {
      onFinished();
    }, 2250);

    return () => {
      clearTimeout(tClash);
      clearTimeout(tCounter);
      clearTimeout(tFinisher);
      clearTimeout(tVictory);
      clearTimeout(tEnd);
    };
  }, [attackerType, victimType, onFinished]);

  const isElephant = attackerType === 'r';
  const isHorse = attackerType === 'n';

  return (
    <div className="absolute inset-0 z-30 pointer-events-none overflow-visible select-none">
      {/* 1. Box 1 War Sigil: Attacker Origin Square */}
      <motion.div
        style={{ left: `${fromCoords.pctX}%`, top: `${fromCoords.pctY}%` }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={
          act === 'victory'
            ? { opacity: 0, scale: 0.5 }
            : { opacity: [0.6, 0.9, 0.6], scale: [0.95, 1.05, 0.95] }
        }
        transition={{ repeat: Infinity, duration: 1.2 }}
        className="absolute w-[12.5%] h-[12.5%] rounded-xl border-2 border-amber-400 bg-amber-500/15 shadow-[0_0_24px_rgba(245,158,11,0.55)] flex items-center justify-center z-10"
      >
        <div className="w-[85%] h-[85%] rounded-full border border-dashed border-amber-300 animate-spin" />
        <span className="absolute bottom-1 text-[8px] sm:text-[10px] font-mono font-bold tracking-widest text-amber-300 uppercase drop-shadow">
          ATTACK
        </span>
      </motion.div>

      {/* 2. Box 2 Defense Ward Sigil: Defender Target Square */}
      <motion.div
        style={{ left: `${toCoords.pctX}%`, top: `${toCoords.pctY}%` }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={
          act === 'victory'
            ? { opacity: 0 }
            : { opacity: [0.7, 1.0, 0.7], scale: [0.96, 1.04, 0.96] }
        }
        transition={{ repeat: Infinity, duration: 1.0 }}
        className="absolute w-[12.5%] h-[12.5%] rounded-xl border-2 border-sky-400 bg-sky-500/15 shadow-[0_0_24px_rgba(56,189,248,0.55)] flex items-center justify-center z-10"
      >
        <div className="w-[85%] h-[85%] rounded-full border border-dashed border-sky-300 animate-spin" />
        <span className="absolute bottom-1 text-[8px] sm:text-[10px] font-mono font-bold tracking-widest text-sky-300 uppercase drop-shadow">
          DEFEND
        </span>
      </motion.div>

      {/* 3. Glowing Combat Charge Path between Box 1 and Box 2 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <line
          x1={`${fromCoords.centerPctX}%`}
          y1={`${fromCoords.centerPctY}%`}
          x2={`${toCoords.centerPctX}%`}
          y2={`${toCoords.centerPctY}%`}
          stroke="#f59e0b"
          strokeWidth="3"
          strokeDasharray="8 5"
          opacity={act !== 'victory' ? 0.75 : 0}
        />
      </svg>

      {/* 4. Full-Screen / Board Impact Burst Flash on Guard Break */}
      {showImpactFlash && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-white/40 z-50 pointer-events-none"
        />
      )}

      {/* 5. Floating Martial Combat Badge Banner */}
      {combatText && (
        <motion.div
          key={combatText}
          initial={{ opacity: 0, y: -10, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          style={{
            left: `${(fromCoords.centerPctX + toCoords.centerPctX) / 2}%`,
            top: `${Math.min(fromCoords.centerPctY, toCoords.centerPctY) - 5}%`,
            transform: 'translate(-50%, -100%)',
          }}
          className="absolute z-50 pointer-events-none px-3 py-1 rounded-full bg-black/85 border border-amber-400 text-amber-300 text-[10px] sm:text-[12px] font-bold tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.8)] whitespace-nowrap"
        >
          {combatText}
        </motion.div>
      )}

      {/* 6. Living Attacker Creature (Charges from Box 1 to Box 2 & Fights) */}
      <motion.div
        style={{ left: `${fromCoords.pctX}%`, top: `${fromCoords.pctY}%` }}
        className="absolute w-[12.5%] h-[12.5%] z-30 flex items-center justify-center overflow-visible"
        initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
        animate={
          act === 'transmute'
            ? { x: 0, y: 0, scale: 1.15, opacity: 1 }
            : act === 'clash'
            ? {
                x: [clashX * 0.8, clashX, clashX * 0.92],
                y: [clashY * 0.8, clashY, clashY * 0.92],
                scale: 1.25,
                opacity: 1,
              }
            : act === 'finisher'
            ? isElephant
              ? {
                  x: deltaX,
                  y: deltaY,
                  scale: [1.25, 1.45, 1.25],
                }
              : isHorse
              ? {
                  x: deltaX,
                  y: deltaY,
                  scale: 1.3,
                  rotate: [0, -15, 20, 0],
                }
              : {
                  x: deltaX,
                  y: deltaY,
                  scale: [1.2, 1.35, 1.15],
                }
            : {
                x: deltaX,
                y: deltaY,
                scale: 1.0,
                opacity: 1,
              }
        }
        transition={{
          duration: act === 'clash' ? 0.35 : act === 'finisher' ? 0.5 : 0.35,
          ease: 'easeInOut',
        }}
      >
        {act === 'victory' ? (
          <ChessPiece2D type={attackerType} color={attackerColor} />
        ) : (
          renderLivingCreature(
            attackerType,
            attackerColor,
            act === 'transmute'
              ? 'charging'
              : act === 'clash'
              ? clashSubPhase === 'strike1'
                ? 'strike'
                : 'parry'
              : 'finisher'
          )
        )}
      </motion.div>

      {/* 7. Living Defender Creature (Stands on Box 2, Parries, Breaks, Demises) */}
      <AnimatePresence>
        {act !== 'victory' && (
          <motion.div
            style={{ left: `${toCoords.pctX}%`, top: `${toCoords.pctY}%` }}
            className="absolute w-[12.5%] h-[12.5%] z-25 flex items-center justify-center overflow-visible"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={
              act === 'transmute'
                ? { scale: 1.0, opacity: 1 }
                : act === 'clash'
                ? clashSubPhase === 'strike1'
                  ? { x: -6, rotate: -10, scale: 1.15, opacity: 1 } // Raising guard in parry
                  : { x: 8, rotate: 12, scale: 1.18, opacity: 1 } // Retaliatory counter
                : act === 'finisher'
                ? isElephant
                  ? { scaleY: 0.08, scaleX: 1.7, y: 16, opacity: 0 } // Pulverized flat into dust by elephant
                  : isHorse
                  ? { x: 42, y: -32, rotate: 95, opacity: 0 } // Kicked flying into ash by stallion
                  : { x: 26, rotate: 55, opacity: 0 } // Sliced and knocked back
                : { scale: 1.0, opacity: 1 }
            }
            transition={{
              duration: act === 'finisher' ? 0.6 : 0.3,
              ease: 'easeOut',
            }}
          >
            {renderLivingCreature(
              victimType,
              victimColor,
              act === 'transmute'
                ? 'idle'
                : act === 'clash'
                ? clashSubPhase === 'strike1'
                  ? 'parry'
                  : 'strike'
                : 'dying'
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. Weapon Sparks Shower at Clash Midpoint */}
      {act === 'clash' && (
        <div
          style={{
            left: `${fromCoords.centerPctX + clashX}%`,
            top: `${fromCoords.centerPctY + clashY}%`,
          }}
          className="absolute z-40 pointer-events-none"
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
              animate={{
                x: Math.cos((angle * Math.PI) / 180) * 32,
                y: Math.sin((angle * Math.PI) / 180) * 32,
                scale: [0, 1.3, 0],
                opacity: [1, 0.9, 0],
              }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_12px_#f59e0b]"
            />
          ))}
          {/* Central Flash Ring */}
          <motion.div
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute -inset-4 rounded-full border-2 border-sky-300 shadow-[0_0_20px_#38bdf8]"
          />
        </div>
      )}

      {/* 9. Earth Shockwave Ring / Blade Slash on Lethal Finisher */}
      {act === 'finisher' && (
        <div
          style={{
            left: `${toCoords.centerPctX}%`,
            top: `${toCoords.centerPctY}%`,
          }}
          className="absolute z-40 pointer-events-none flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
        >
          {isElephant ? (
            /* Expanding Heavy Ground Fissure Ring */
            <motion.div
              initial={{ scale: 0.3, opacity: 1 }}
              animate={{ scale: 3.2, opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="w-24 h-24 rounded-full border-4 border-amber-500 shadow-[0_0_40px_#ea580c] bg-radial from-amber-500/40 to-transparent"
            />
          ) : (
            /* Sharp Cleaving Energy Ribbon */
            <motion.div
              initial={{ scaleX: 0, opacity: 1 }}
              animate={{ scaleX: 2.6, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-32 h-3 bg-gradient-to-r from-transparent via-sky-400 to-transparent rotate-[-35deg] shadow-[0_0_30px_#38bdf8]"
            />
          )}
        </div>
      )}
    </div>
  );
};
