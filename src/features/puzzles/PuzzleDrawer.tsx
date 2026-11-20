import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChessStore } from '../../stores/useChessStore';
import { PUZZLES_DATABASE } from '../../services/puzzleBook';
import { X, Puzzle, CheckCircle2, XCircle, Lightbulb, ArrowRight, Award } from 'lucide-react';

interface PuzzleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PuzzleDrawer: React.FC<PuzzleDrawerProps> = ({ isOpen, onClose }) => {
  const { currentPuzzleId, puzzleState, loadPuzzle } = useChessStore();
  const [showHint, setShowHint] = React.useState(false);

  if (!isOpen) return null;

  const currentPuzzle = PUZZLES_DATABASE.find((p) => p.id === currentPuzzleId) || PUZZLES_DATABASE[0];

  const handleSelectPuzzle = (id: string) => {
    setShowHint(false);
    loadPuzzle(id);
  };

  const handleNextPuzzle = () => {
    const currentIndex = PUZZLES_DATABASE.findIndex((p) => p.id === currentPuzzle.id);
    const nextIndex = (currentIndex + 1) % PUZZLES_DATABASE.length;
    handleSelectPuzzle(PUZZLES_DATABASE[nextIndex].id);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="w-full max-w-md h-full bg-[#101217] border-l border-stone-800 p-6 flex flex-col shadow-2xl overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Puzzle className="w-5 h-5 text-amber-400" />
              <h2 className="font-display text-lg font-bold text-gold-gradient">
                Tactics & Puzzles
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Puzzle Status Banner */}
          {currentPuzzle && (
            <div className="my-4 p-4 rounded-xl glass-panel-gold border border-amber-400/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-semibold">
                  Rating: {currentPuzzle.rating}
                </span>
                <span className="text-xs text-stone-400 font-medium">
                  {currentPuzzle.theme}
                </span>
              </div>

              <h3 className="font-bold text-stone-100 text-base mb-1">
                {currentPuzzle.title}
              </h3>
              <p className="text-xs text-stone-300 mb-3">
                {currentPuzzle.description}
              </p>

              {/* Status banner */}
              {puzzleState === 'solved' && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-semibold mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Brilliant! Puzzle Solved Successfully.</span>
                </div>
              )}

              {puzzleState === 'failed' && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-semibold mb-3">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>Suboptimal move. Try again or review your lines.</span>
                </div>
              )}

              {/* Hint button */}
              {showHint ? (
                <div className="text-xs p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 mb-3">
                  💡 Hint: {currentPuzzle.hint}
                </div>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors mb-3"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Need a hint?</span>
                </button>
              )}

              <button
                onClick={handleNextPuzzle}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors"
              >
                <span>Next Puzzle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Puzzle List */}
          <div className="flex-1 mt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Puzzle Collection
            </h4>
            <div className="space-y-2">
              {PUZZLES_DATABASE.map((puzzle) => {
                const isSelected = currentPuzzleId === puzzle.id;
                return (
                  <button
                    key={puzzle.id}
                    onClick={() => handleSelectPuzzle(puzzle.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 shadow-gold-glow'
                        : 'border-stone-800 bg-stone-900/50 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-stone-100">{puzzle.title}</div>
                      <div className="text-[11px] text-stone-400">{puzzle.theme}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-semibold text-amber-400">
                        {puzzle.rating}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
