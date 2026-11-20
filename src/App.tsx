import React, { useState, useEffect } from 'react';
import { useChessStore } from './stores/useChessStore';
import { TopNav } from './components/ui/TopNav';
import { Chessboard2D } from './components/chessboard/Chessboard2D';
import { Chessboard3D } from './components/chessboard/Chessboard3D';
import { PlayerCard } from './components/player/PlayerCard';
import { MoveHistoryPanel } from './components/move-history/MoveHistoryPanel';
import { ControlBar } from './components/game-controls/ControlBar';
import { EvaluationBar } from './components/ui/EvaluationBar';
import { MatchIntelPanel } from './components/ui/MatchIntelPanel';
import { PromotionModal } from './components/modals/PromotionModal';
import { GameOverModal } from './components/modals/GameOverModal';
import { GameModeModal } from './components/modals/GameModeModal';
import { SettingsModal } from './features/settings/SettingsModal';
import { MultiplayerModal } from './features/multiplayer/MultiplayerModal';
import { PuzzleDrawer } from './features/puzzles/PuzzleDrawer';
import { OpeningDrawer } from './features/openings/OpeningDrawer';
import { ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const App: React.FC = () => {
  const {
    turn,
    status,
    viewMode,
    orientation,
    playerWhite,
    playerBlack,
  } = useChessStore();

  const [isGameModesOpen, setIsGameModesOpen] = useState(false);
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPuzzlesOpen, setIsPuzzlesOpen] = useState(false);
  const [isOpeningsOpen, setIsOpeningsOpen] = useState(false);

  // Auto-open multiplayer dialog if room invite code is present in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('room')) {
      setIsMultiplayerOpen(true);
    }
  }, []);

  const topPlayer = orientation === 'w' ? playerBlack : playerWhite;
  const topColor = orientation === 'w' ? 'b' : 'w';

  const bottomPlayer = orientation === 'w' ? playerWhite : playerBlack;
  const bottomColor = orientation === 'w' ? 'w' : 'b';

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0b0e] text-slate-100 flex flex-col font-sans select-none selection:bg-amber-500/30">
      {/* Top Navigation Bar (Fixed 56px height, no-overflow guaranteed) */}
      <TopNav
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPuzzles={() => setIsPuzzlesOpen(true)}
        onOpenOpenings={() => setIsOpeningsOpen(true)}
        onOpenGameModes={() => setIsGameModesOpen(true)}
        onOpenMultiplayer={() => setIsMultiplayerOpen(true)}
      />

      {/* Main Full-Width Studio Layout */}
      <main className="flex-1 h-[calc(100vh-3.5rem)] overflow-y-auto lg:overflow-hidden p-2 sm:p-3 lg:p-4 flex items-center justify-center">
        <div className="w-full max-w-[1780px] h-full flex flex-col lg:flex-row items-center justify-center gap-3 lg:gap-4 xl:gap-6 2xl:gap-8">
          
          {/* Left Column: Match Intel, Opening Theory & Material Balance (Desktop >= 1024px) */}
          <div className="hidden lg:flex w-[260px] xl:w-[300px] 2xl:w-[340px] shrink-0 h-[min(92vw,calc(100vh-100px),820px)] flex-col justify-between py-1">
            <MatchIntelPanel />
          </div>

          {/* Center Column: Grandmaster Chess Arena (Hero Board + Integrated Player Cards) */}
          <div className="flex flex-col items-center justify-center shrink-0 space-y-1.5 sm:space-y-2">
            {/* Top Opponent Player Card */}
            <div className="w-[min(92vw,calc(100vh-170px),720px)] xl:w-[min(92vw,calc(100vh-160px),760px)] 2xl:w-[min(92vw,calc(100vh-150px),800px)]">
              <PlayerCard
                color={topColor}
                profile={topPlayer}
                isCurrentTurn={turn === topColor}
              />
            </div>

            {/* Check Warning Notification Banner */}
            <AnimatePresence>
              {status === 'check' && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/60 text-red-300 text-xs font-semibold shadow-crimson-glow"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                  <span>Check!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chessboard Row with Attached Evaluation Bar */}
            <div className="flex items-stretch gap-1.5 sm:gap-2 justify-center">
              <div className="hidden sm:flex shrink-0">
                <EvaluationBar />
              </div>
              
              <div className="relative">
                {viewMode === '2d' ? <Chessboard2D /> : <Chessboard3D />}
              </div>
            </div>

            {/* Bottom Player Card */}
            <div className="w-[min(92vw,calc(100vh-170px),720px)] xl:w-[min(92vw,calc(100vh-160px),760px)] 2xl:w-[min(92vw,calc(100vh-150px),800px)]">
              <PlayerCard
                color={bottomColor}
                profile={bottomPlayer}
                isCurrentTurn={turn === bottomColor}
              />
            </div>
          </div>

          {/* Right Column: Spacious Game Studio & Notation Timeline */}
          <div className="w-full max-w-[min(92vw,720px)] lg:w-[340px] xl:w-[380px] 2xl:w-[420px] shrink-0 h-[min(92vw,calc(100vh-100px),820px)] flex flex-col gap-2.5 py-1">
            {/* Control Bar (Zero-overflow 2-tier toolbar) */}
            <ControlBar onOpenSettings={() => setIsSettingsOpen(true)} />

            {/* Move History & Replay Timeline (Expands to fill vertical studio height) */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <MoveHistoryPanel />
            </div>
          </div>
        </div>
      </main>

      {/* Modals & Overlays */}
      <PromotionModal />
      <GameOverModal />
      <GameModeModal
        isOpen={isGameModesOpen}
        onClose={() => setIsGameModesOpen(false)}
        onOpenMultiplayer={() => {
          setIsGameModesOpen(false);
          setIsMultiplayerOpen(true);
        }}
      />
      <MultiplayerModal
        isOpen={isMultiplayerOpen}
        onClose={() => setIsMultiplayerOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <PuzzleDrawer
        isOpen={isPuzzlesOpen}
        onClose={() => setIsPuzzlesOpen(false)}
      />
      <OpeningDrawer
        isOpen={isOpeningsOpen}
        onClose={() => setIsOpeningsOpen(false)}
      />
    </div>
  );
};

export default App;
