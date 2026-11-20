import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChessStore } from '../../stores/useChessStore';
import { Trophy, RotateCcw, Eye, ShieldAlert, Award } from 'lucide-react';

export const GameOverModal: React.FC = () => {
  const { status, winner, restartGame, history, gameMode, playerWhite, playerBlack } = useChessStore();

  const isGameOver = [
    'checkmate',
    'stalemate',
    'draw_repetition',
    'draw_fifty_moves',
    'draw_insufficient_material',
    'resigned',
    'timeout',
  ].includes(status);

  if (!isGameOver) return null;

  const totalMoves = Math.ceil(history.length / 2);
  const winnerName =
    winner === 'w' ? playerWhite.name : winner === 'b' ? playerBlack.name : 'Draw';

  const getStatusHeadline = () => {
    switch (status) {
      case 'checkmate':
        return `Victory by Checkmate!`;
      case 'resigned':
        return `Victory by Resignation`;
      case 'timeout':
        return `Victory on Time`;
      case 'stalemate':
        return `Stalemate — Position Drawn`;
      case 'draw_repetition':
        return `Draw by Threefold Repetition`;
      case 'draw_fifty_moves':
        return `Draw by 50-Move Rule`;
      case 'draw_insufficient_material':
        return `Draw by Insufficient Material`;
      default:
        return `Game Concluded`;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ type: 'spring', stiffness: 400, damping: 26 }}
          className="relative w-full max-w-md rounded-2xl p-6 sm:p-8 glass-panel-gold border border-amber-400/50 shadow-2xl text-center"
        >
          {/* Trophy Header Icon */}
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 shadow-gold-glow mb-4">
            {winner === 'draw' ? (
              <ShieldAlert className="w-8 h-8" />
            ) : (
              <Trophy className="w-8 h-8" />
            )}
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-gold-gradient tracking-wide mb-1">
            {winner === 'draw' ? 'Draw Game' : `${winnerName} Wins!`}
          </h2>

          <p className="text-sm font-medium text-amber-200/90 mb-6">
            {getStatusHeadline()}
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-xl bg-stone-900/60 border border-stone-800">
            <div className="flex flex-col items-center">
              <span className="text-xs text-stone-400">Total Moves</span>
              <span className="text-lg font-bold font-mono text-stone-200">{totalMoves}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-stone-400">Mode</span>
              <span className="text-sm font-semibold capitalize text-amber-300">
                {gameMode === 'pve' ? 'vs Computer' : gameMode}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => restartGame()}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-900/40 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Rematch</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
