import React from 'react';
import { GameMode } from '../../types/chess';
import { useChessStore } from '../../stores/useChessStore';
import { 
  Crown, 
  Bot, 
  Users, 
  Globe, 
  Puzzle, 
  BookOpen, 
  Settings, 
  PlusCircle,
  ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TopNavProps {
  onOpenSettings: () => void;
  onOpenPuzzles: () => void;
  onOpenOpenings: () => void;
  onOpenGameModes: () => void;
  onOpenMultiplayer: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenSettings,
  onOpenPuzzles,
  onOpenOpenings,
  onOpenGameModes,
  onOpenMultiplayer,
}) => {
  const { gameMode, setGameMode, aiDifficulty } = useChessStore();

  const getModeLabel = () => {
    switch (gameMode) {
      case 'pve':
        return 'vs Computer';
      case 'pvp-local':
        return 'Local Play';
      case 'pvp-online':
        return 'Multiplayer';
      case 'puzzle':
        return 'Puzzles';
      case 'openings':
        return 'Openings';
      default:
        return 'Practice';
    }
  };

  return (
    <header className="w-full h-14 shrink-0 border-b border-stone-800/80 bg-[#0a0b0e]/95 backdrop-blur-xl z-40 px-3 sm:px-6">
      <div className="w-full h-full max-w-[1780px] mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand & Logo */}
        <div 
          onClick={onOpenGameModes}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer shrink-0 group select-none"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 text-stone-950 shadow-gold-glow group-hover:scale-105 transition-transform">
            <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-sm sm:text-base tracking-wider text-gold-gradient uppercase leading-none">
                Grandmaster
              </span>
              <span className="hidden sm:inline-block px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                PRO
              </span>
            </div>
            <span className="text-[9px] text-amber-200/50 font-mono tracking-widest uppercase hidden sm:block">
              World-Class Chess
            </span>
          </div>
        </div>

        {/* Center: Segmented Navigation (Desktop screens >= 1024px) */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-stone-900/90 border border-stone-800 shadow-inner">
          <button
            onClick={() => {
              if (gameMode === 'pve') {
                onOpenGameModes();
              } else {
                setGameMode('pve');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gameMode === 'pve'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-gold-glow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Play vs Stockfish AI (Click again to change difficulty)"
          >
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span>vs Computer</span>
          </button>

          <button
            onClick={() => {
              if (gameMode === 'pvp-local') {
                onOpenGameModes();
              } else {
                setGameMode('pvp-local');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gameMode === 'pvp-local'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.25)]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Local 2-Player Pass & Play"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Local Play</span>
          </button>

          <button
            onClick={onOpenMultiplayer}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gameMode === 'pvp-online'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Online Multiplayer Room"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>Multiplayer</span>
          </button>

          <button
            onClick={onOpenPuzzles}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gameMode === 'puzzle'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Daily Tactics Puzzles"
          >
            <Puzzle className="w-3.5 h-3.5 text-purple-400" />
            <span>Puzzles</span>
          </button>

          <button
            onClick={onOpenOpenings}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gameMode === 'openings'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Master Openings Explorer"
          >
            <BookOpen className="w-3.5 h-3.5 text-rose-400" />
            <span>Openings</span>
          </button>
        </nav>

        {/* Compact Mode Pill (Mobile/Tablet screens < 1024px) */}
        <div className="flex lg:hidden items-center">
          <button
            onClick={onOpenGameModes}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-stone-900 border border-stone-800 text-xs font-semibold text-amber-300 hover:bg-stone-800 transition-colors"
          >
            <span>{getModeLabel()}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>
        </div>

        {/* Right Actions: Guaranteed no-overflow margin */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenGameModes}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-gold-glow transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Game</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-300 transition-colors"
            title="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </header>
  );
};
