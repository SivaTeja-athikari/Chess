import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square, PieceType, Color } from '../../types/chess';
import { useChessStore } from '../../stores/useChessStore';
import { BOARD_THEMES } from '../../constants/themes';
import { ChessPiece2D } from '../chess-pieces/ChessPiece2D';
import { LivingPieceMorph2D } from '../chess-pieces/LivingPieceMorph2D';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const Chessboard2D: React.FC = () => {
  const {
    game,
    selectedSquare,
    legalMoves,
    lastMove,
    boardTheme,
    orientation,
    selectSquare,
    makeMove,
    status,
    turn,
    activeCombat,
    clearActiveCombat,
    gameMode,
    multiplayerRoom,
  } = useChessStore();

  const theme = BOARD_THEMES[boardTheme];
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);

  const displayFiles = orientation === 'w' ? FILES : [...FILES].reverse();
  const displayRanks = orientation === 'w' ? RANKS : [...RANKS].reverse();

  // Find king square if in check
  let checkSquare: Square | null = null;
  if (status === 'check' || status === 'checkmate') {
    const board = game.board();
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

  const handleSquareClick = (sq: Square) => {
    selectSquare(sq);
  };

  const handleDragStart = (sq: Square) => {
    if (gameMode === 'pvp-online' && multiplayerRoom) {
      const piece = game.get(sq);
      if (turn !== multiplayerRoom.playerColor || piece?.color !== multiplayerRoom.playerColor) {
        return;
      }
    }
    setDraggedSquare(sq);
    selectSquare(sq);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (sq: Square) => {
    if (draggedSquare && draggedSquare !== sq) {
      const piece = game.get(draggedSquare);
      if (gameMode === 'pvp-online' && multiplayerRoom) {
        if (turn !== multiplayerRoom.playerColor || piece?.color !== multiplayerRoom.playerColor) {
          setDraggedSquare(null);
          return;
        }
      }
      const isPawnPromotion =
        piece?.type === 'p' &&
        ((piece.color === 'w' && sq.endsWith('8')) || (piece.color === 'b' && sq.endsWith('1')));

      if (isPawnPromotion) {
        selectSquare(sq);
      } else {
        makeMove(draggedSquare, sq);
      }
    }
    setDraggedSquare(null);
  };

  return (
    <div className="relative p-1.5 sm:p-2 rounded-2xl shadow-luxury bg-gradient-to-br from-[#2a1e14] via-[#1a140f] to-[#0d0a08] border border-amber-900/50">
      {/* Outer Metallic Bevel Frame */}
      <div className="relative rounded-xl overflow-hidden border-2 border-[#d4af37]/35 shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),inset_0_-2px_4px_rgba(0,0,0,0.7)]">
        {/* Dynamic Responsive Board Dimensions bound to Viewport Height with Guaranteed Player Card Padding */}
        <div className="relative aspect-square w-[min(90vw,calc(100vh-245px),580px)] h-[min(90vw,calc(100vh-245px),580px)] xl:w-[min(90vw,calc(100vh-240px),620px)] xl:h-[min(90vw,calc(100vh-240px),620px)] 2xl:w-[min(90vw,calc(100vh-235px),660px)] 2xl:h-[min(90vw,calc(100vh-235px),660px)]">
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
            {displayRanks.map((rank, rankIndex) =>
              displayFiles.map((file, fileIndex) => {
                const square = `${file}${rank}` as Square;
                const isLight = (rankIndex + fileIndex) % 2 === 0;
                const piece = game.get(square);

                const isSelected = selectedSquare === square;
                const isLegalTarget = legalMoves.includes(square);
                const isLastMoveSquare =
                  lastMove && (lastMove.from === square || lastMove.to === square);
                const isCheckKingSquare = checkSquare === square;

                return (
                  <div
                    key={square}
                    onClick={() => handleSquareClick(square)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(square)}
                    style={{
                      backgroundColor: isLight ? theme.lightSquare : theme.darkSquare,
                    }}
                    className="relative aspect-square flex items-center justify-center cursor-pointer select-none overflow-hidden transition-colors duration-150"
                  >
                    {/* Last Move Overlay */}
                    {isLastMoveSquare && (
                      <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                        style={{ backgroundColor: theme.highlightLastMove }}
                      />
                    )}

                    {/* Selected Square Overlay */}
                    {isSelected && (
                      <motion.div
                        layoutId="selected-highlight"
                        className="absolute inset-0 pointer-events-none border-2 border-amber-400"
                        style={{ backgroundColor: theme.highlightSelected }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}

                    {/* King In Check Red Pulsing Halo */}
                    {isCheckKingSquare && (
                      <div className="absolute inset-0 pointer-events-none bg-red-600/40 animate-pulse border-2 border-red-500 shadow-crimson-glow" />
                    )}

                    {/* Rank Coordinate Label (Leftmost files) */}
                    {fileIndex === 0 && (
                      <span
                        className={`absolute top-0.5 left-1 text-[9px] sm:text-[11px] font-mono font-bold pointer-events-none transition-colors ${
                          isLight ? 'text-stone-700/80' : 'text-amber-100/75'
                        }`}
                      >
                        {rank}
                      </span>
                    )}

                    {/* File Coordinate Label (Bottommost rank) */}
                    {rankIndex === 7 && (
                      <span
                        className={`absolute bottom-0.5 right-1 text-[9px] sm:text-[11px] font-mono font-bold pointer-events-none transition-colors ${
                          isLight ? 'text-stone-700/80' : 'text-amber-100/75'
                        }`}
                      >
                        {file}
                      </span>
                    )}

                    {/* Legal Move Indicator (Target dot or Capture ring) */}
                    {isLegalTarget && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        {piece ? (
                          /* Capture target: Ring with corner pulse */
                          <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-[84%] h-[84%] rounded-full border-4 border-amber-400/80 shadow-[0_0_12px_rgba(212,175,55,0.7)]"
                          />
                        ) : (
                          /* Empty square: Subtle luminous dot */
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-amber-400/80 shadow-[0_0_8px_rgba(212,175,55,0.9)]"
                          />
                        )}
                      </div>
                    )}

                    {/* Chess Piece (Suppressed on both fromSquare and toSquare while Two-Box Living Battle Morph is active) */}
                    <AnimatePresence mode="popLayout">
                      {piece &&
                        (!activeCombat ||
                          (activeCombat.square !== square && activeCombat.fromSquare !== square)) && (
                          <motion.div
                            key={`${piece.color}-${piece.type}-${square}`}
                            draggable={piece.color === turn && (gameMode !== 'pvp-online' || piece.color === multiplayerRoom?.playerColor)}
                            onDragStart={() => handleDragStart(square)}
                            className="relative z-10 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                            initial={{ opacity: 0.8, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                          >
                            <ChessPiece2D
                              type={piece.type as PieceType}
                              color={piece.color as Color}
                              isSelected={isSelected}
                            />
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* Active Two-Box Living Piece Morph Martial Duel Animation */}
          {activeCombat && (
            <LivingPieceMorph2D
              key={`living-morph-${activeCombat.id}`}
              attackerType={activeCombat.attackerType}
              attackerColor={activeCombat.attackerColor}
              victimType={activeCombat.victimType}
              victimColor={activeCombat.victimColor}
              fromSquare={activeCombat.fromSquare}
              toSquare={activeCombat.square}
              orientation={orientation}
              onFinished={clearActiveCombat}
            />
          )}
        </div>
      </div>
    </div>
  );
};
