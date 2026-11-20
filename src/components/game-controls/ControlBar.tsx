import React from 'react';
import { useChessStore } from '../../stores/useChessStore';
import { 
  RotateCcw, 
  Flag, 
  ArrowLeftRight, 
  Volume2, 
  VolumeX, 
  Box, 
  Layers, 
  Undo2,
  SlidersHorizontal 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ControlBarProps {
  onOpenSettings?: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({ onOpenSettings }) => {
  const {
    undoMove,
    restartGame,
    resign,
    flipBoard,
    turn,
    viewMode,
    setViewMode,
    isMuted,
    setSoundMuted,
    status,
    history,
    gameMode,
  } = useChessStore();

  const isGameOver = [
    'checkmate',
    'stalemate',
    'draw_repetition',
    'draw_fifty_moves',
    'draw_insufficient_material',
    'resigned',
    'timeout',
  ].includes(status);

  return (
    <div className="w-full p-2.5 rounded-2xl glass-panel border border-stone-800/80 shadow-xl flex flex-col gap-2">
      {/* Row 1: Primary Match Actions (Undo, Reset, Flip, Resign) */}
      <div className={`grid ${gameMode === 'pvp-online' ? 'grid-cols-3' : 'grid-cols-4'} gap-2`}>
        {/* Undo (Disabled & Removed in Online Multiplayer) */}
        {gameMode !== 'pvp-online' && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={undoMove}
            disabled={history.length === 0}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-semibold disabled:opacity-30 disabled:hover:bg-stone-900/90 transition-all"
            title="Takeback Move"
          >
            <Undo2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Undo</span>
          </motion.button>
        )}

        {/* Reset */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => restartGame()}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-semibold transition-all"
          title="Restart Match"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Reset</span>
        </motion.button>

        {/* Flip */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={flipBoard}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-semibold transition-all"
          title="Flip Perspective"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Flip</span>
        </motion.button>

        {/* Resign */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => resign(turn)}
          disabled={isGameOver || history.length === 0}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-semibold disabled:opacity-30 disabled:hover:bg-red-950/40 transition-all"
          title="Resign Match"
        >
          <Flag className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>Resign</span>
        </motion.button>
      </div>

      {/* Row 2: View Mode, Audio, and Settings (Evenly distributed, zero overflow) */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-800/60">
        {/* 2D / 3D Toggle */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
            viewMode === '3d'
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-gold-glow'
              : 'bg-stone-900/90 border-stone-800 text-stone-300 hover:text-white'
          }`}
          title="Toggle 2D / 3D Perspective"
        >
          {viewMode === '3d' ? (
            <Box className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          ) : (
            <Layers className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          )}
          <span>{viewMode.toUpperCase()} Mode</span>
        </motion.button>

        {/* Audio Mute Toggle */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setSoundMuted(!isMuted)}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
            isMuted
              ? 'bg-red-950/30 border-red-800/40 text-red-400'
              : 'bg-stone-900/90 border-stone-800 text-stone-300 hover:text-white'
          }`}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-red-400 shrink-0" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
          <span>{isMuted ? 'Muted' : 'Sound'}</span>
        </motion.button>

        {/* Settings */}
        {onOpenSettings && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-semibold transition-all"
            title="Configure Game Settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Options</span>
          </motion.button>
        )}
      </div>
    </div>
  );
};
