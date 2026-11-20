import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieceType, Color } from '../../types/chess';
import { useChessStore } from '../../stores/useChessStore';
import { ChessPiece2D } from '../chess-pieces/ChessPiece2D';
import { Crown, Sparkles, X } from 'lucide-react';

const PROMOTION_PIECES: { type: PieceType; label: string; shortcut: string }[] = [
  { type: 'q', label: 'Queen', shortcut: 'Q' },
  { type: 'r', label: 'Rook', shortcut: 'R' },
  { type: 'b', label: 'Bishop', shortcut: 'B' },
  { type: 'n', label: 'Knight', shortcut: 'N' },
];

export const PromotionModal: React.FC = () => {
  const { pendingPromotion, confirmPromotion, cancelPromotion, turn } = useChessStore();

  if (!pendingPromotion) return null;

  const color: Color = turn === 'w' ? 'w' : 'b';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
          className="relative w-full max-w-md rounded-2xl p-6 glass-panel-gold border border-amber-400/40 shadow-2xl text-center"
        >
          {/* Close / Cancel Button */}
          <button
            onClick={cancelPromotion}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-amber-400" />
            <h3 className="font-display text-xl font-bold text-gold-gradient tracking-wide">
              Pawn Coronation
            </h3>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>

          <p className="text-sm text-stone-300 mb-6 font-light">
            Select the noble rank your pawn shall ascend to:
          </p>

          <div className="grid grid-cols-4 gap-3">
            {PROMOTION_PIECES.map(({ type, label, shortcut }) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => confirmPromotion(type)}
                className="group relative flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-stone-800/80 to-stone-900/90 border border-amber-500/20 hover:border-amber-400 hover:shadow-gold-glow transition-all"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-1">
                  <ChessPiece2D type={type} color={color} />
                </div>
                <span className="text-xs font-medium text-stone-200 group-hover:text-amber-300 transition-colors">
                  {label}
                </span>
                <span className="text-[10px] text-stone-400 font-mono mt-0.5">
                  [{shortcut}]
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
