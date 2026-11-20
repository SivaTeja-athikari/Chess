import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChessStore } from '../../stores/useChessStore';
import { AIDifficulty, Color, GameMode } from '../../types/chess';
import { 
  Bot, 
  Users, 
  Globe, 
  X, 
  Crown, 
  Sparkles, 
  ArrowRight, 
  Check, 
  RotateCcw,
  Zap
} from 'lucide-react';

interface GameModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMultiplayer: () => void;
}

const AI_DIFFICULTIES: { id: AIDifficulty; label: string; elo: number; desc: string }[] = [
  { id: 'beginner', label: 'Beginner', elo: 600, desc: 'Casual, occasional blunders' },
  { id: 'easy', label: 'Easy', elo: 1100, desc: 'Understands basic captures' },
  { id: 'intermediate', label: 'Intermediate', elo: 1600, desc: 'Solid positional play & defense' },
  { id: 'advanced', label: 'Advanced', elo: 2000, desc: 'Alpha-beta calculation & tactics' },
  { id: 'expert', label: 'Expert', elo: 2400, desc: 'Positional mastery & king attacks' },
  { id: 'master', label: 'Master', elo: 2800, desc: 'Grandmaster level technique' },
];

export const GameModeModal: React.FC<GameModeModalProps> = ({
  isOpen,
  onClose,
  onOpenMultiplayer,
}) => {
  const {
    gameMode,
    setGameMode,
    aiDifficulty,
    setAIDifficulty,
    orientation,
    flipBoard,
    autoFlipLocal,
    toggleAutoFlipLocal,
    restartGame,
  } = useChessStore();

  const [selectedTab, setSelectedTab] = useState<'pve' | 'pvp-local' | 'pvp-online'>(
    gameMode === 'pvp-local' ? 'pvp-local' : gameMode === 'pvp-online' ? 'pvp-online' : 'pve'
  );
  const [playerSide, setPlayerSide] = useState<Color>('w');

  if (!isOpen) return null;

  const handleStartMatch = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'pve') {
      useChessStore.setState({
        orientation: playerSide,
        aiColor: playerSide === 'w' ? 'b' : 'w',
      });
    }
    restartGame();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
          className="relative w-full max-w-2xl rounded-2xl p-6 sm:p-8 glass-panel-gold border border-amber-400/40 shadow-2xl max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 flex items-center justify-center shadow-gold-glow">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-gold-gradient tracking-wide">
                  Select Game Mode
                </h2>
                <p className="text-xs text-stone-400">Choose how you want to play</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3 Main Mode Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
            {/* vs Computer */}
            <button
              onClick={() => setSelectedTab('pve')}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                selectedTab === 'pve'
                  ? 'border-amber-400 bg-amber-500/15 shadow-gold-glow'
                  : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-3">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-stone-100 mb-1">vs Computer</span>
              <span className="text-xs text-stone-400 leading-relaxed">
                Stockfish AI with 6 adaptive ELO strength tiers.
              </span>
              <span className="mt-3 text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                Solo Training
              </span>
            </button>

            {/* Local Play */}
            <button
              onClick={() => setSelectedTab('pvp-local')}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                selectedTab === 'pvp-local'
                  ? 'border-emerald-400 bg-emerald-500/15 shadow-[0_0_20px_rgba(52,211,153,0.2)]'
                  : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-stone-100 mb-1">Local Play</span>
              <span className="text-xs text-stone-400 leading-relaxed">
                2 players on 1 screen with optional auto-board flip.
              </span>
              <span className="mt-3 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                Pass & Play
              </span>
            </button>

            {/* Online Multiplayer */}
            <button
              onClick={() => setSelectedTab('pvp-online')}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                selectedTab === 'pvp-online'
                  ? 'border-sky-400 bg-sky-500/15 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                  : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center mb-3">
                <Globe className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-stone-100 mb-1">Multiplayer</span>
              <span className="text-xs text-stone-400 leading-relaxed">
                Create private rooms or invite a friend with a room code.
              </span>
              <span className="mt-3 text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
                Online PVP
              </span>
            </button>
          </div>

          {/* Mode Configuration Settings Area */}
          <div className="p-4 rounded-xl bg-stone-900/70 border border-stone-800">
            {selectedTab === 'pve' && (
              <div className="space-y-4">
                {/* Choose Play Side */}
                <div>
                  <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-2">
                    Play as
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPlayerSide('w')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                        playerSide === 'w'
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                          : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-white border border-stone-900 inline-block" />
                      <span>White (Moves First)</span>
                    </button>
                    <button
                      onClick={() => setPlayerSide('b')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                        playerSide === 'b'
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                          : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-stone-900 border border-stone-600 inline-block" />
                      <span>Black (Moves Second)</span>
                    </button>
                  </div>
                </div>

                {/* AI Difficulty Grid */}
                <div>
                  <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-2">
                    AI Difficulty Tier
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AI_DIFFICULTIES.map(({ id, label, elo }) => {
                      const isSelected = aiDifficulty === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setAIDifficulty(id)}
                          className={`p-2 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-sm'
                              : 'border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          <div className="text-xs font-bold text-stone-200">{label}</div>
                          <div className="text-[10px] font-mono text-amber-400">ELO ~{elo}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => handleStartMatch('pve')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-gold-glow transition-all"
                >
                  <span>Start vs Computer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {selectedTab === 'pvp-local' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-stone-900 border border-stone-800">
                  <div>
                    <div className="text-sm font-semibold text-stone-100">
                      Auto-Flip Board per Turn
                    </div>
                    <div className="text-xs text-stone-400">
                      Flips perspective automatically so each player faces their army
                    </div>
                  </div>
                  <button
                    onClick={toggleAutoFlipLocal}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                      autoFlipLocal ? 'bg-emerald-500' : 'bg-stone-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                        autoFlipLocal ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => handleStartMatch('pvp-local')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 font-bold text-sm shadow-lg shadow-emerald-900/40 transition-all"
                >
                  <span>Start Local 2-Player Match</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {selectedTab === 'pvp-online' && (
              <div className="space-y-4 text-center">
                <p className="text-xs text-stone-300">
                  Ready to battle opponents online? Create a private game room with an invite code or join an active match.
                </p>

                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMultiplayer();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-stone-950 font-bold text-sm shadow-lg shadow-sky-900/40 transition-all"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Open Multiplayer Lobby</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
