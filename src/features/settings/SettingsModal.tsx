import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChessStore } from '../../stores/useChessStore';
import { AIDifficulty, BoardThemeId } from '../../types/chess';
import { BOARD_THEMES } from '../../constants/themes';
import { 
  X, 
  Volume2, 
  Shield, 
  Palette, 
  Clock, 
  Check, 
  Sliders, 
  Layers, 
  Sparkles,
  Flame 
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AI_LEVELS: { id: AIDifficulty; label: string; elo: number; desc: string }[] = [
  { id: 'beginner', label: 'Beginner', elo: 600, desc: 'Casual play, frequent blunders' },
  { id: 'easy', label: 'Easy', elo: 1100, desc: 'Understands basic captures & checks' },
  { id: 'intermediate', label: 'Intermediate', elo: 1600, desc: 'Solid position & tactical safety' },
  { id: 'advanced', label: 'Advanced', elo: 2000, desc: 'Alpha-beta calculation & heuristics' },
  { id: 'expert', label: 'Expert', elo: 2400, desc: 'Aggressive attacking & king safety' },
  { id: 'master', label: 'Master', elo: 2800, desc: 'Full grandmaster depth' },
];

const TIME_PRESETS: { label: string; seconds: number | null }[] = [
  { label: '1m Bullet', seconds: 60 },
  { label: '3m Blitz', seconds: 180 },
  { label: '5m Blitz', seconds: 300 },
  { label: '10m Rapid', seconds: 600 },
  { label: '30m Classical', seconds: 1800 },
  { label: 'Unlimited', seconds: null },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    boardTheme,
    setBoardTheme,
    viewMode,
    setViewMode,
    aiDifficulty,
    setAIDifficulty,
    soundVolume,
    setSoundVolume,
    isMuted,
    setSoundMuted,
    timeLimit,
    restartGame,
    cinematicBattleMode,
    toggleCinematicBattleMode,
  } = useChessStore();

  const [activeTab, setActiveTab] = useState<'themes' | 'engine' | 'match'>('themes');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl bg-[#12141a] border border-amber-400/30 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-[#161922]">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <h2 className="font-display text-lg font-bold text-stone-100 tracking-wide">
                Settings & Preferences
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Segmented Navigation Tabs */}
          <div className="flex px-5 pt-3 border-b border-stone-800/80 bg-[#12141a] gap-2">
            <button
              onClick={() => setActiveTab('themes')}
              className={`flex items-center gap-1.5 py-2 px-3 border-b-2 text-xs font-bold transition-all ${
                activeTab === 'themes'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Theme & View</span>
            </button>

            <button
              onClick={() => setActiveTab('engine')}
              className={`flex items-center gap-1.5 py-2 px-3 border-b-2 text-xs font-bold transition-all ${
                activeTab === 'engine'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>AI Opponent</span>
            </button>

            <button
              onClick={() => setActiveTab('match')}
              className={`flex items-center gap-1.5 py-2 px-3 border-b-2 text-xs font-bold transition-all ${
                activeTab === 'match'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timer & Audio</span>
            </button>
          </div>

          {/* Tab Body (Scrollable with comfortable bounds) */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1 text-sm">
            {activeTab === 'themes' && (
              <div className="space-y-4">
                {/* 2D / 3D Toggle Selection */}
                <div>
                  <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                    Board Perspective Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setViewMode('2d')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all ${
                        viewMode === '2d'
                          ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-sm'
                          : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>2D Vector Board</span>
                    </button>

                    <button
                      onClick={() => setViewMode('3d')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all ${
                        viewMode === '3d'
                          ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-gold-glow'
                          : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>3D Staunton Stage</span>
                    </button>
                  </div>
                </div>

                {/* Theme Cards */}
                <div>
                  <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                    Board & Piece Palette
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(Object.keys(BOARD_THEMES) as BoardThemeId[]).map((themeId) => {
                      const t = BOARD_THEMES[themeId];
                      const isSelected = boardTheme === themeId;
                      return (
                        <button
                          key={themeId}
                          onClick={() => setBoardTheme(themeId)}
                          className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500/15 shadow-gold-glow'
                              : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-stone-100">{t.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                          </div>
                          {/* Mini Board Swatch */}
                          <div className="flex h-5 w-full rounded overflow-hidden border border-black/40">
                            <div className="flex-1" style={{ backgroundColor: t.lightSquare }} />
                            <div className="flex-1" style={{ backgroundColor: t.darkSquare }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cinematic Battle Animations Switch */}
                <div className="pt-3 border-t border-stone-800/80">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900/60 border border-stone-800">
                    <div className="flex flex-col pr-3">
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-bold text-stone-200">
                          Cinematic War Battle Cutscenes
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400 mt-0.5">
                        Shows animated soldier duels & weapon clashes on piece captures
                      </span>
                    </div>

                    <button
                      onClick={toggleCinematicBattleMode}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                        cinematicBattleMode ? 'bg-amber-500 shadow-gold-glow' : 'bg-stone-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          cinematicBattleMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'engine' && (
              <div>
                <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                  Stockfish AI Difficulty Tier
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {AI_LEVELS.map(({ id, label, elo, desc }) => {
                    const isSelected = aiDifficulty === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setAIDifficulty(id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/15 shadow-gold-glow'
                            : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-stone-100">{label}</span>
                          <span className="text-[10px] font-mono text-amber-400 font-semibold">
                            ~{elo}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 leading-tight">{desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'match' && (
              <div className="space-y-4">
                {/* Time Limits */}
                <div>
                  <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                    Clock Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_PRESETS.map((preset) => {
                      const isSelected = timeLimit === preset.seconds;
                      return (
                        <button
                          key={preset.label}
                          onClick={() => {
                            useChessStore.setState({
                              timeLimit: preset.seconds,
                              whiteTime: preset.seconds || 600,
                              blackTime: preset.seconds || 600,
                            });
                            restartGame();
                          }}
                          className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-sm'
                              : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Audio Volume Slider */}
                <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-semibold text-stone-200">
                        Sound Effects Volume
                      </span>
                    </div>
                    <button
                      onClick={() => setSoundMuted(!isMuted)}
                      className="text-xs text-amber-400 hover:underline font-mono"
                    >
                      {isMuted ? 'Muted' : `${Math.round(soundVolume * 100)}%`}
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : soundVolume}
                    onChange={(e) => {
                      setSoundMuted(false);
                      setSoundVolume(parseFloat(e.target.value));
                    }}
                    className="w-full accent-amber-400 bg-stone-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-stone-800 bg-[#161922] flex justify-end">
            <button
              onClick={onClose}
              className="py-2 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
