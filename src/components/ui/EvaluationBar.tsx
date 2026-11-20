import React, { useMemo } from 'react';
import { useChessStore } from '../../stores/useChessStore';
import { evaluateBoard } from '../../engine/chess-engine/evaluation';

export const EvaluationBar: React.FC = () => {
  const { game, fen, viewingMoveIndex } = useChessStore();

  const evalScore = useMemo(() => {
    return evaluateBoard(game);
  }, [game, fen, viewingMoveIndex]);

  const percentage = useMemo(() => {
    const winChance = 1 / (1 + Math.pow(10, -evalScore / 400));
    return Math.max(5, Math.min(95, winChance * 100));
  }, [evalScore]);

  const displayScore = useMemo(() => {
    if (Math.abs(evalScore) >= 20000) {
      return evalScore > 0 ? 'M' : '-M';
    }
    const val = (evalScore / 100).toFixed(1);
    return evalScore > 0 ? `+${val}` : val;
  }, [evalScore]);

  return (
    <div className="relative w-7 sm:w-8 flex flex-col items-center h-full select-none justify-between py-1">
      {/* The Meter Track */}
      <div className="relative w-3 sm:w-3.5 flex-1 rounded-full overflow-hidden bg-[#181c24] border border-stone-800 shadow-md flex flex-col justify-end">
        {/* White Advantage */}
        <div
          className="w-full bg-gradient-to-t from-stone-200 via-amber-100 to-white transition-all duration-500 ease-out"
          style={{ height: `${percentage}%` }}
        />
      </div>

      {/* Floating Score Badge (Positioned below the track, never clipped) */}
      <div className="mt-1.5 flex items-center justify-center shrink-0">
        <span className="font-mono text-[9px] sm:text-[10px] font-bold text-amber-300 bg-stone-900/90 px-1 py-0.5 rounded border border-amber-400/40 shadow-sm leading-none whitespace-nowrap">
          {displayScore}
        </span>
      </div>
    </div>
  );
};
