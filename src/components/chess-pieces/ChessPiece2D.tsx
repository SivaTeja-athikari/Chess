import React from 'react';
import { motion } from 'framer-motion';
import { Color, PieceType } from '../../types/chess';

interface ChessPiece2DProps {
  type: PieceType;
  color: Color;
  isSelected?: boolean;
  isDragging?: boolean;
  className?: string;
}

export const ChessPiece2D: React.FC<ChessPiece2DProps> = ({
  type,
  color,
  isSelected = false,
  className = '',
}) => {
  const isWhite = color === 'w';

  // Master Palette
  const bodyGradId = isWhite ? 'white-master-body' : 'black-master-body';
  const trimGradId = isWhite ? 'gold-trim-grad' : 'silver-trim-grad';
  const shadowGradId = isWhite ? 'white-inner-shadow' : 'black-inner-shadow';

  const strokeMain = isWhite ? '#855b14' : '#090d16';
  const strokeInner = isWhite ? 'rgba(212, 175, 55, 0.6)' : 'rgba(148, 163, 184, 0.35)';
  const highlightGlint = isWhite ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.35)';
  const accentGold = '#d4af37';
  const accentPlatinum = '#cbd5e1';
  const gemColor = isWhite ? accentGold : accentPlatinum;

  const renderPieceSvg = () => {
    switch (type) {
      /* ============================================================
       *  PAWN (The Noble Foot Soldier)
       * ============================================================ */
      case 'p':
        return (
          <g id="pawn-master">
            {/* Plinth Base */}
            <path
              d="M26 88 C26 83 32 82 50 82 C68 82 74 83 74 88 C74 91 66 92 50 92 C34 92 26 91 26 88 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeMain}
              strokeWidth="2.4"
            />
            {/* Lower Base Ring */}
            <path
              d="M31 82 C31 77 36 76 50 76 C64 76 69 77 69 82 Z"
              fill={`url(#${trimGradId})`}
              stroke={strokeMain}
              strokeWidth="1.8"
            />
            {/* Fluted Body Stem */}
            <path
              d="M36 76 C37 62 43 53 43 42 L57 42 C57 53 63 62 64 76 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeMain}
              strokeWidth="2.4"
            />
            {/* Stem Light Contour Reflection */}
            <path
              d="M45 72 C44 60 47 52 47 44"
              stroke={highlightGlint}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Neck Astragal Ring Collar */}
            <path
              d="M36 42 C36 38 41 37 50 37 C59 37 64 38 64 42 C64 44 59 45 50 45 C41 45 36 44 36 42 Z"
              fill={`url(#${trimGradId})`}
              stroke={strokeMain}
              strokeWidth="1.8"
            />
            {/* Polished Spherical Head */}
            <circle
              cx="50"
              cy="25"
              r="14.5"
              fill={`url(#${bodyGradId})`}
              stroke={strokeMain}
              strokeWidth="2.4"
            />
            {/* Spherical Specular Glint */}
            <ellipse
              cx="45.5"
              cy="20.5"
              rx="5.5"
              ry="3.5"
              transform="rotate(-25 45.5 20.5)"
              fill={highlightGlint}
            />
          </g>
        );

      /* ============================================================
       *  KNIGHT (The Royal Warhorse)
       * ============================================================ */
      case 'n':
        return (
          <g id="knight-master">
            {/* Plinth Base */}
            <path
              d="M24 88 C24 83 31 82 50 82 C69 82 76 83 76 88 C76 91 68 92 50 92 C32 92 24 91 24 88 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeMain}
              strokeWidth="2.4"
            />
            {/* Base Molding */}
            <path
              d="M29 82 C29 78 34 77 50 77 C66 77 71 78 71 82 Z"
              fill={`url(#${trimGradId})`}
              stroke={strokeMain}
              strokeWidth="1.8"
            />
            {/* Sculpted Steed Body & Head */}
            <path
              d="M30 82 C30 73 34 65 38 58 C34 56 26 50 24 39 C23 28 32 18 42 16 C46 11 53 8 62 10 C62 14 65 17 69 20 C73 23 78 27 77 34 C76 39 71 42 66 43 C64 45 61 50 64 57 C68 66 71 74 71 82 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeMain}
              strokeWidth="2.4"
            />
            {/* Alert Pricked Ears */}
            <path
              d="M44 16 L49 6 L55 14 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeMain}
              strokeWidth="2"
            />
            <path
              d="M52 14 L57 8 L62 13 Z"
              fill={`url(#${trimGradId})`}
              stroke={strokeMain}
              strokeWidth="1.6"
            />
            {/* Flowing Mane Tufts */}
            <path
              d="M60 12 C64 16 68 20 66 26 C69 28 73 32 70 38 C72 43 73 50 69 57 C71 65 71 73 70 80"
              stroke={strokeMain}
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Expressive Horse Eye with Glint */}
            <circle cx="38" cy="30" r="3.2" fill={strokeMain} />
            <circle cx="37" cy="29" r="1.2" fill="#ffffff" />
            {/* Flared Nostril */}
            <ellipse cx="28" cy="42" rx="2" ry="3.5" transform="rotate(-15 28 42)" fill={strokeMain} />
            {/* Bridle Muzzle Crease */}
            <path
              d="M25 47 C29 49 33 48 36 45"
              stroke={strokeMain}
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
            {/* Muscular Neck Ridge & Jaw Highlight */}
            <path
              d="M42 56 C46 63 53 68 62 70"
              stroke={highlightGlint}
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        );

      /* ============================================================
       *  BISHOP (The Sacred Mitre)
       * ============================================================ */
      case 'b':
        return (
          <g id="bishop-master">
            {/* Plinth Base */}
            <path
              d="M25 88 C25 83 32 82 50 82 C68 82 75 83 75 88 C75 91 67 92 50 92 C33 92 25 91 25 88 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeMain}
              strokeWidth="2.4"
            />
            {/* Gold Rim Band */}
            <path
              d="M30 82 C30 77 36 76 50 76 C64 76 70 77 70 82 Z"
              fill={`url(#${trimGradId})`}
              stroke={strokeMain}
              strokeWidth="1.8"
            />
            {/* Tapered Waist Robe */}
            <path
              d="M35 76 C36 65 42 58 42 48 L58 48 C58 58 64 65 65 76 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeMain}
              strokeWidth="2.4"
            />
            {/* Mitre Collar Trim */}
            <path
              d="M36 48 C36 44 41 43 50 43 C59 43 64 44 64 48 C64 50 59 51 50 51 C41 51 36 50 36 48 Z"
              fill={`url(#${trimGradId})`}
              stroke={strokeMain}
              strokeWidth="1.8"
            />
            {/* Sacred Ovoid Mitre */}
            <path
              d="M36 44 C34 32 40 18 50 14 C60 18 66 32 64 44 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeMain}
              strokeWidth="2.4"
            />
            {/* Iconic Diagonal Mitre Slit Cut */}
            <path
              d="M46 25 L58 37"
              stroke={strokeMain}
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            {/* Mitre Golden Cross Motif */}
            <path
              d="M49 20 L51 20 M50 18 L50 24"
              stroke={gemColor}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            {/* Mitre Apex Pearl Finial */}
            <circle
              cx="50"
              cy="12"
              r="4.2"
              fill={`url(#${trimGradId})`}
              stroke={strokeMain}
              strokeWidth="1.6"
            />
            {/* Highlight Curve */}
            <path
              d="M42 38 C41 30 44 22 47 18"
              stroke={highlightGlint}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );

      /* ============================================================
       *  ROOK (The Citadel Fortress)
       * ============================================================ */
      case 'r':
        return (
          <g id="rook-master">
            {/* Broad Plinth Base */}
            <path
              d="M23 88 C23 83 31 82 50 82 C69 82 77 83 77 88 C77 91 68 92 50 92 C32 92 23 91 23 88 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeMain}
              strokeWidth="2.4"
            />
            {/* Lower Torus Ring */}
            <path
              d="M28 82 C28 77 34 76 50 76 C66 76 72 77 72 82 Z"
              fill={`url(#${trimGradId})`}
              stroke={strokeMain}
              strokeWidth="1.8"
            />
            {/* Heavy Stone Tower Walls */}
            <path
              d="M34 76 C35 62 38 52 38 38 L62 38 C62 52 65 62 66 76 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeMain}
              strokeWidth="2.4"
            />
            {/* Tower Corbel Shelf Trim */}
            <rect
              x="31"
              y="34"
              width="38"
              height="5"
              rx="1.5"
              fill={`url(#${trimGradId})`}
              stroke={strokeMain}
              strokeWidth="1.8"
            />
            {/* 4 Castellated Merlons & Embrasures */}
            <path
              d="M32 34 L32 18 L40 18 L40 24 L46 24 L46 18 L54 18 L54 24 L60 24 L60 18 L68 18 L68 34 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeMain}
              strokeWidth="2.4"
            />
            {/* Stone Wall Arrow Slit Embrazure */}
            <rect
              x="47.5"
              y="48"
              width="5"
              height="16"
              rx="2.5"
              fill={strokeMain}
              opacity="0.8"
            />
            {/* Fortress Wall Specular Highlight */}
            <path
              d="M39 72 C39 58 42 50 42 40"
              stroke={highlightGlint}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );

      /* ============================================================
       *  QUEEN (The Sovereign Empress)
       * ============================================================ */
      case 'q':
        return (
          <g id="queen-master">
            {/* Plinth Base */}
            <path
              d="M22 88 C22 83 30 82 50 82 C70 82 78 83 78 88 C78 91 69 92 50 92 C31 92 22 91 22 88 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeMain}
              strokeWidth="2.4"
            />
            {/* Royal Gold Molding */}
            <path
              d="M28 82 C28 77 34 76 50 76 C66 76 72 77 72 82 Z"
              fill={`url(#${trimGradId})`}
              stroke={strokeMain}
              strokeWidth="1.8"
            />
            {/* Fluted Royal Robe */}
            <path
              d="M34 76 C36 62 40 50 40 40 L60 40 C60 50 64 62 66 76 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeMain}
              strokeWidth="2.4"
            />
            {/* Royal Waist Sash */}
            <path
              d="M36 40 C36 36 41 35 50 35 C59 35 64 36 64 40 C64 42 59 43 50 43 C41 43 36 42 36 40 Z"
              fill={`url(#${trimGradId})`}
              stroke={strokeMain}
              strokeWidth="1.8"
            />
            {/* 5-Pointed Scalloped Coronet */}
            <path
              d="M27 40 L23 20 L35 29 L50 14 L65 29 L77 20 L73 40 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeMain}
              strokeWidth="2.4"
            />
            {/* 5 Radiant Pearls on Crown Tips */}
            <circle cx="23" cy="18" r="3.2" fill={gemColor} stroke={strokeMain} strokeWidth="1.4" />
            <circle cx="35" cy="27" r="3.2" fill={gemColor} stroke={strokeMain} strokeWidth="1.4" />
            <circle cx="50" cy="12" r="4.2" fill={gemColor} stroke={strokeMain} strokeWidth="1.6" />
            <circle cx="65" cy="27" r="3.2" fill={gemColor} stroke={strokeMain} strokeWidth="1.4" />
            <circle cx="77" cy="18" r="3.2" fill={gemColor} stroke={strokeMain} strokeWidth="1.4" />
            {/* Central Diamond Medallion */}
            <polygon points="50,26 53,30 50,34 47,30" fill={gemColor} stroke={strokeMain} strokeWidth="1" />
            {/* Robe Specular Highlight */}
            <path
              d="M42 72 C41 60 44 48 44 42"
              stroke={highlightGlint}
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );

      /* ============================================================
       *  KING (The Imperial Monarch)
       * ============================================================ */
      case 'k':
        return (
          <g id="king-master">
            {/* Broad Imperial Base */}
            <path
              d="M21 88 C21 83 29 82 50 82 C71 82 79 83 79 88 C79 91 70 92 50 92 C30 92 21 91 21 88 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeMain}
              strokeWidth="2.4"
            />
            {/* Gold Pedestal Rim */}
            <path
              d="M27 82 C27 77 33 76 50 76 C67 76 73 77 73 82 Z"
              fill={`url(#${trimGradId})`}
              stroke={strokeMain}
              strokeWidth="1.8"
            />
            {/* Grand Imperial Robe */}
            <path
              d="M33 76 C35 60 39 48 39 38 L61 38 C61 48 65 60 67 76 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeMain}
              strokeWidth="2.4"
            />
            {/* Ermine Collar Fur Band */}
            <rect
              x="35"
              y="35"
              width="30"
              height="6"
              rx="2"
              fill={`url(#${trimGradId})`}
              stroke={strokeMain}
              strokeWidth="1.8"
            />
            {/* Imperial Crown Arches */}
            <path
              d="M32 35 C28 22 36 15 50 15 C64 15 72 22 68 35 Z"
              fill={`url(#${bodyGradId})`}
              stroke={strokeMain}
              strokeWidth="2.4"
            />
            {/* Crown Arch Ribs */}
            <path
              d="M50 15 L50 35 M40 18 C44 24 45 30 45 35 M60 18 C56 24 55 30 55 35"
              stroke={strokeInner}
              strokeWidth="1.6"
              fill="none"
            />
            {/* Imperial Maltese / Latin Golden Cross */}
            <g id="king-cross">
              {/* Vertical Cross Beam */}
              <path
                d="M47 3 L53 3 L53 15 L47 15 Z"
                fill={gemColor}
                stroke={strokeMain}
                strokeWidth="1.6"
              />
              {/* Horizontal Cross Beam */}
              <path
                d="M43 6 L57 6 L57 10 L43 10 Z"
                fill={gemColor}
                stroke={strokeMain}
                strokeWidth="1.6"
              />
              {/* Central Diamond Eye */}
              <circle cx="50" cy="8" r="1.5" fill="#ffffff" />
            </g>
            {/* Robe Highlight Contour */}
            <path
              d="M41 72 C40 58 43 46 43 38"
              stroke={highlightGlint}
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );
    }
  };

  return (
    <motion.div
      className={`relative w-full h-full flex items-center justify-center pointer-events-none select-none ${className}`}
      animate={{
        scale: isSelected ? 1.15 : 1,
        y: isSelected ? -8 : 0,
        filter: isSelected
          ? 'drop-shadow(0 14px 18px rgba(245, 158, 11, 0.45)) drop-shadow(0 4px 6px rgba(0,0,0,0.8))'
          : 'drop-shadow(0 6px 8px rgba(0,0,0,0.55)) drop-shadow(0 2px 3px rgba(0,0,0,0.4))',
      }}
      transition={{ type: 'spring', stiffness: 450, damping: 26 }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-[88%] h-[88%] transition-transform duration-200"
      >
        <defs>
          {/* ============================================================
           *  WHITE PIECE LUXURY PALETTE (Polished Imperial Ivory & Gold)
           * ============================================================ */}
          <linearGradient id="white-master-body" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fdfaf3" />
            <stop offset="70%" stopColor="#f3ecdb" />
            <stop offset="90%" stopColor="#e2d4bc" />
            <stop offset="100%" stopColor="#cfbe9f" />
          </linearGradient>

          <linearGradient id="gold-trim-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          {/* ============================================================
           *  BLACK PIECE LUXURY PALETTE (Forged Damascus Obsidian & Platinum)
           * ============================================================ */}
          <linearGradient id="black-master-body" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#384357" />
            <stop offset="35%" stopColor="#252d3c" />
            <stop offset="70%" stopColor="#151a24" />
            <stop offset="90%" stopColor="#0b0e14" />
            <stop offset="100%" stopColor="#05070a" />
          </linearGradient>

          <linearGradient id="silver-trim-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#cbd5e1" />
            <stop offset="80%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Radial Ambient Occlusion for Crown Bases */}
          <radialGradient id="piece-radial-ambient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
          </radialGradient>
        </defs>

        {renderPieceSvg()}
      </svg>
    </motion.div>
  );
};
