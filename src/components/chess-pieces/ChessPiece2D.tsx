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

  // Master luxury color palette
  const fillPrimary = isWhite ? 'url(#white-piece-grad)' : 'url(#black-piece-grad)';
  const strokePrimary = isWhite ? '#9a7b20' : '#475569';
  const highlightFill = isWhite ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.15)';

  const renderPieceSvg = () => {
    switch (type) {
      case 'p': // Pawn
        return (
          <g>
            <ellipse cx="50" cy="85" rx="22" ry="7" fill={fillPrimary} stroke={strokePrimary} strokeWidth="2.5" />
            <path d="M35 85 C36 70 42 62 44 48 C40 48 37 45 37 42 C37 39 40 37 45 37 C45 37 45 33 50 33 C55 33 55 37 55 37 C60 37 63 39 63 42 C63 45 60 48 56 48 C58 62 64 70 65 85 Z" fill={fillPrimary} stroke={strokePrimary} strokeWidth="2.5" />
            <circle cx="50" cy="25" r="14" fill={fillPrimary} stroke={strokePrimary} strokeWidth="2.5" />
            <ellipse cx="46" cy="21" rx="5" ry="3" fill={highlightFill} />
          </g>
        );

      case 'n': // Knight
        return (
          <g>
            <ellipse cx="50" cy="86" rx="24" ry="7" fill={fillPrimary} stroke={strokePrimary} strokeWidth="2.5" />
            <path
              d="M32 86 C32 75 35 68 40 60 C36 58 30 52 30 42 C30 30 38 22 48 20 C52 14 58 12 66 14 C65 18 67 22 72 26 C75 28 80 32 78 38 C76 43 71 44 68 44 C65 44 62 48 64 54 C68 64 70 75 68 86 Z"
              fill={fillPrimary}
              stroke={strokePrimary}
              strokeWidth="2.5"
            />
            {/* Mane & Ear */}
            <path d="M48 20 L53 10 L59 18 Z" fill={fillPrimary} stroke={strokePrimary} strokeWidth="2" />
            <circle cx="42" cy="32" r="3" fill={strokePrimary} />
            {/* Nostril */}
            <circle cx="34" cy="46" r="2" fill={strokePrimary} />
            {/* Jaw highlight */}
            <path d="M42 60 C46 66 52 70 60 72" stroke={highlightFill} strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'b': // Bishop
        return (
          <g>
            <ellipse cx="50" cy="86" rx="24" ry="7" fill={fillPrimary} stroke={strokePrimary} strokeWidth="2.5" />
            <path d="M34 86 C36 74 42 66 42 54 L38 52 C38 48 42 46 44 46 C40 38 42 26 50 16 C58 26 60 38 56 46 C58 46 62 48 62 52 L58 54 C58 66 64 74 66 86 Z" fill={fillPrimary} stroke={strokePrimary} strokeWidth="2.5" />
            {/* Bishop cut */}
            <path d="M47 30 L58 40" stroke={strokePrimary} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="14" r="4.5" fill={isWhite ? '#d4af37' : '#94a3b8'} stroke={strokePrimary} strokeWidth="1.5" />
            <ellipse cx="47" cy="38" rx="3" ry="8" fill={highlightFill} />
          </g>
        );

      case 'r': // Rook
        return (
          <g>
            <ellipse cx="50" cy="86" rx="25" ry="7" fill={fillPrimary} stroke={strokePrimary} strokeWidth="2.5" />
            <path d="M34 86 C36 72 39 64 39 48 L61 48 C61 64 64 72 66 86 Z" fill={fillPrimary} stroke={strokePrimary} strokeWidth="2.5" />
            {/* Battlements */}
            <path d="M33 48 L33 28 L40 28 L40 35 L47 35 L47 28 L53 28 L53 35 L60 35 L60 28 L67 28 L67 48 Z" fill={fillPrimary} stroke={strokePrimary} strokeWidth="2.5" />
            <line x1="33" y1="48" x2="67" y2="48" stroke={strokePrimary} strokeWidth="2" />
            <rect x="42" y="55" width="16" height="20" rx="2" fill="none" stroke={highlightFill} strokeWidth="1.5" />
          </g>
        );

      case 'q': // Queen
        return (
          <g>
            <ellipse cx="50" cy="87" rx="26" ry="7" fill={fillPrimary} stroke={strokePrimary} strokeWidth="2.5" />
            <path d="M32 87 C35 70 40 60 40 48 L60 48 C60 60 65 70 68 87 Z" fill={fillPrimary} stroke={strokePrimary} strokeWidth="2.5" />
            {/* Crown peaks */}
            <path d="M30 48 L26 28 L38 38 L50 22 L62 38 L74 28 L70 48 Z" fill={fillPrimary} stroke={strokePrimary} strokeWidth="2.5" />
            {/* Pearls on crown */}
            <circle cx="26" cy="26" r="3" fill="#d4af37" stroke={strokePrimary} strokeWidth="1.2" />
            <circle cx="38" cy="36" r="3" fill="#d4af37" stroke={strokePrimary} strokeWidth="1.2" />
            <circle cx="50" cy="20" r="3.5" fill="#d4af37" stroke={strokePrimary} strokeWidth="1.2" />
            <circle cx="62" cy="36" r="3" fill="#d4af37" stroke={strokePrimary} strokeWidth="1.2" />
            <circle cx="74" cy="26" r="3" fill="#d4af37" stroke={strokePrimary} strokeWidth="1.2" />
            <ellipse cx="46" cy="62" rx="4" ry="12" fill={highlightFill} />
          </g>
        );

      case 'k': // King
        return (
          <g>
            <ellipse cx="50" cy="87" rx="26" ry="7" fill={fillPrimary} stroke={strokePrimary} strokeWidth="2.5" />
            <path d="M32 87 C35 70 39 60 39 46 L61 46 C61 60 65 70 68 87 Z" fill={fillPrimary} stroke={strokePrimary} strokeWidth="2.5" />
            {/* Imperial arched crown */}
            <path d="M32 46 C28 34 36 26 50 26 C64 26 72 34 68 46 Z" fill={fillPrimary} stroke={strokePrimary} strokeWidth="2.5" />
            {/* Imperial Royal Cross */}
            <path d="M47 11 L53 11 L53 26 L47 26 Z M43 15 L57 15 L57 20 L43 20 Z" fill="#d4af37" stroke={strokePrimary} strokeWidth="1.5" />
            <ellipse cx="50" cy="34" rx="8" ry="4" fill="none" stroke={strokePrimary} strokeWidth="1.5" />
            <ellipse cx="46" cy="60" rx="4" ry="12" fill={highlightFill} />
          </g>
        );
    }
  };

  return (
    <motion.div
      className={`relative w-full h-full flex items-center justify-center pointer-events-none select-none ${className}`}
      animate={{
        scale: isSelected ? 1.14 : 1,
        y: isSelected ? -7 : 0,
      }}
      transition={{ type: 'spring', stiffness: 450, damping: 28 }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-[85%] h-[85%] drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)]"
      >
        <defs>
          <linearGradient id="white-piece-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#f7f3ea" />
            <stop offset="85%" stopColor="#eae2cf" />
            <stop offset="100%" stopColor="#d9cdb4" />
          </linearGradient>

          <linearGradient id="black-piece-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#333b49" />
            <stop offset="50%" stopColor="#1f2530" />
            <stop offset="85%" stopColor="#141820" />
            <stop offset="100%" stopColor="#0b0e14" />
          </linearGradient>
        </defs>

        {renderPieceSvg()}
      </svg>
    </motion.div>
  );
};
