import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChessStore } from '../../stores/useChessStore';
import { PieceType, Color } from '../../types/chess';
import { 
  Swords, 
  X, 
  Flame, 
  Film
} from 'lucide-react';
import { MovieBattleCinema } from './MovieBattleCinema';

const PIECE_WAR_PROFILES: Record<
  PieceType,
  {
    name: string;
    subName: string;
    weapon: string;
    role: string;
  }
> = {
  p: {
    name: 'Frontline Soldier',
    subName: 'Infantry Vanguard',
    weapon: 'Spear & Iron Shield',
    role: 'Foot Soldier',
  },
  n: {
    name: 'Armored Knight',
    subName: 'Heavy Cavalry Paladin',
    weapon: 'Broadsword & Lance',
    role: 'Mounted Shock Troop',
  },
  b: {
    name: 'Inquisitor Assassin',
    subName: 'Long-Range Zealot',
    weapon: 'Sacred Piercing Blade',
    role: 'Diagonal Sniper',
  },
  r: {
    name: 'Siege Juggernaut',
    subName: 'Iron War Citadel',
    weapon: 'Cataclysmic Warhammer',
    role: 'Siege Fortress',
  },
  q: {
    name: 'Royal Empress',
    subName: 'Supreme War Commander',
    weapon: 'Twin Golden Rapiers',
    role: 'Apex Striker',
  },
  k: {
    name: 'Sovereign Monarch',
    subName: 'Supreme High King',
    weapon: 'Imperial Greatsword',
    role: 'Crown Defender',
  },
};

export const CinematicBattleOverlay: React.FC = () => {
  const { 
    activeCombat, 
    clearActiveCombat, 
    cinematicBattleMode, 
    toggleCinematicBattleMode 
  } = useChessStore();

  useEffect(() => {
    if (!activeCombat || !cinematicBattleMode) return;

    // Auto-dismiss after 2.1 seconds (matches 3D movie sequence length)
    const timer = setTimeout(() => {
      clearActiveCombat();
    }, 2100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        clearActiveCombat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeCombat, cinematicBattleMode, clearActiveCombat]);

  if (!activeCombat || !cinematicBattleMode) return null;

  const attackerInfo = PIECE_WAR_PROFILES[activeCombat.attackerType];
  const victimInfo = PIECE_WAR_PROFILES[activeCombat.victimType];

  const isSoldierDuel = activeCombat.attackerType === 'p' && activeCombat.victimType === 'p';

  // Dynamic headline & flavor narrative
  let clashHeadline = '⚔️ BATTLEFIELD CLASH';
  let clashDescription = `${attackerInfo.name} delivers a lethal blow to ${victimInfo.name}!`;

  if (isSoldierDuel) {
    clashHeadline = '⚔️ SOLDIER DUEL — INFANTRY WAR';
    clashDescription =
      'Frontline soldier thrusts spear — enemy infantry struck down in brutal melee combat!';
  } else if (activeCombat.attackerType === 'n') {
    clashHeadline = '⚔️ CAVALRY FLANK — LANCE STRIKE';
    clashDescription = `Mounted knight charges at full speed, cleaving through the enemy ${victimInfo.role}!`;
  } else if (activeCombat.attackerType === 'r') {
    clashHeadline = '⚔️ SIEGE IMPACT — CATACLYSM';
    clashDescription = `Iron siege power crushes all resistance on ${activeCombat.square.toUpperCase()}!`;
  } else if (activeCombat.attackerType === 'q') {
    clashHeadline = '⚔️ ROYAL EXECUTION — DOMINANCE';
    clashDescription = `The Queen sweeps across the battlefield with lethal surgical precision!`;
  } else if (activeCombat.attackerType === 'b') {
    clashHeadline = '⚔️ INQUISITOR STRIKE — AMBUSH';
    clashDescription = `Long-range piercing ambush executes the target instantly!`;
  } else if (activeCombat.attackerType === 'k') {
    clashHeadline = "⚔️ KING'S VENGEANCE — SOVEREIGN FURY";
    clashDescription = `The King personally strikes down the intruder on ${activeCombat.square.toUpperCase()}!`;
  }

  const attackerArmy = activeCombat.attackerColor === 'w' ? 'White Royal Legion' : 'Black Shadow Army';
  const victimArmy = activeCombat.victimColor === 'w' ? 'White Royal Legion' : 'Black Shadow Army';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={clearActiveCombat}
        className="fixed inset-0 z-50 flex flex-col justify-between pointer-events-auto bg-black/85 select-none cursor-pointer overflow-hidden"
      >
        {/* Top Cinematic 2.39:1 Letterbox Bar */}
        <motion.div
          initial={{ y: -70 }}
          animate={{ y: 0 }}
          exit={{ y: -70 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full h-16 sm:h-20 bg-[#06070a]/95 border-b border-amber-500/30 shadow-2xl flex items-center justify-between px-4 sm:px-8 z-20"
        >
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-mono font-bold tracking-wider animate-pulse">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>CINEMATIC WAR CLASH</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-display font-extrabold text-amber-300 tracking-wider">
                {clashHeadline}
              </span>
              <span className="text-[11px] text-stone-300 hidden md:block">
                {clashDescription}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-mono text-xs hidden lg:inline bg-black/60 px-2 py-1 rounded border border-amber-500/30">
              SQUARE {activeCombat.square.toUpperCase()} ({activeCombat.san})
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCinematicBattleMode();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-[11px] font-mono text-stone-300 hover:text-amber-300 transition-colors"
              title="Toggle Combat Cutscene Animation"
            >
              <Film className="w-3 h-3 text-amber-400" />
              <span>Movie Mode: {cinematicBattleMode ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                clearActiveCombat();
              }}
              className="p-1 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition-colors"
              title="Skip Movie Scene"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Center: Live 3D Movie Battlefield Arena */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          <MovieBattleCinema
            attackerColor={activeCombat.attackerColor}
            attackerType={activeCombat.attackerType}
            victimColor={activeCombat.victimColor}
            victimType={activeCombat.victimType}
            onFinished={clearActiveCombat}
          />

          {/* Cinematic Letterbox Lens Vignette */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />

          {/* Floating Live Subtitles Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="absolute bottom-4 inset-x-0 mx-auto max-w-lg text-center pointer-events-none z-10 px-4"
          >
            <div className="p-2 sm:p-2.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 shadow-2xl">
              <span className="text-[11px] sm:text-xs font-mono text-amber-200/90 italic block">
                {isSoldierDuel
                  ? '"For the realm! Frontline soldier breaks the enemy line!"'
                  : `"${attackerInfo.name} executes decisive strike upon ${victimInfo.name}."`}
              </span>
              <span className="text-[9px] font-mono text-stone-400 block mt-0.5">
                {attackerArmy} ➔ {victimArmy} ({activeCombat.san})
              </span>
            </div>
          </motion.div>
        </div>

        {/* Bottom Cinematic 2.39:1 Letterbox Bar */}
        <motion.div
          initial={{ y: 70 }}
          animate={{ y: 0 }}
          exit={{ y: 70 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full h-12 sm:h-14 bg-[#06070a]/95 border-t border-amber-500/30 shadow-2xl flex items-center justify-between px-4 sm:px-8 z-20"
        >
          <span className="text-[10px] sm:text-[11px] font-mono text-stone-400 flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-200">Space</kbd>
            <span>or click anywhere to skip movie scene</span>
          </span>

          <span className="text-[10px] sm:text-[11px] font-mono text-amber-400/80">
            AAA 60 FPS 3D Battlefield Kinematics
          </span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

