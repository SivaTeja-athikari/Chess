import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChessStore } from '../../stores/useChessStore';
import { OPENINGS_DATABASE } from '../../services/openingBook';
import { X, BookOpen, Check, Play, Sparkles } from 'lucide-react';

interface OpeningDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OpeningDrawer: React.FC<OpeningDrawerProps> = ({ isOpen, onClose }) => {
  const { currentOpeningId, loadOpening } = useChessStore();

  if (!isOpen) return null;

  const currentOpening =
    OPENINGS_DATABASE.find((o) => o.id === currentOpeningId) || OPENINGS_DATABASE[0];

  const handleSelectOpening = (id: string) => {
    loadOpening(id);
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
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h2 className="font-display text-lg font-bold text-gold-gradient">
                Master Openings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Opening Spotlight */}
          {currentOpening && (
            <div className="my-4 p-4 rounded-xl glass-panel-gold border border-amber-400/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-amber-400/20 text-amber-300">
                  ECO: {currentOpening.eco}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                  {currentOpening.difficulty}
                </span>
              </div>

              <h3 className="font-bold text-stone-100 text-base mb-1">
                {currentOpening.name}
              </h3>
              <p className="text-xs text-stone-300 mb-3 leading-relaxed">
                {currentOpening.description}
              </p>

              {/* Move sequence */}
              <div className="flex flex-wrap gap-1.5 mb-3 p-2 rounded-lg bg-stone-900/80 border border-stone-800">
                {currentOpening.moves.map((move, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono px-1.5 py-0.5 rounded bg-stone-800/80 text-amber-300"
                  >
                    {idx % 2 === 0 ? `${idx / 2 + 1}. ` : ''}
                    {move}
                  </span>
                ))}
              </div>

              {/* Strategic Keys */}
              <div className="mb-4">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Key Strategic Themes:
                </span>
                <ul className="space-y-1">
                  {currentOpening.keyIdeas.map((idea, idx) => (
                    <li key={idx} className="text-xs text-stone-300 flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSelectOpening(currentOpening.id)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-stone-950" />
                <span>Practice This Opening</span>
              </button>
            </div>
          )}

          {/* Openings Catalog */}
          <div className="flex-1 mt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Grandmaster Repertoire
            </h4>
            <div className="space-y-2">
              {OPENINGS_DATABASE.map((opening) => {
                const isSelected = currentOpeningId === opening.id;
                return (
                  <button
                    key={opening.id}
                    onClick={() => handleSelectOpening(opening.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 shadow-gold-glow'
                        : 'border-stone-800 bg-stone-900/50 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-stone-100">{opening.name}</div>
                      <div className="text-[11px] text-stone-400 font-mono">ECO {opening.eco}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
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
