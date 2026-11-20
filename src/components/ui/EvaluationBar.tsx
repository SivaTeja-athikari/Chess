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

  const isWhiteAdvantage = evalScore >= 0;

  return (
    <div className="relative w-6 sm:w-7 h-full flex flex-col items-center select-none py-0.5">
      {/* The Meter Track (Exact height of board, perfectly aligned) */}
      <div className="relative w-2.5 sm:w-3 h-full rounded-full overflow-hidden bg-[#181c24] border border-stone-800 shadow-md flex flex-col justify-end">
        {/* White Advantage */}
        <div
          className="w-full bg-gradient-to-t from-stone-200 via-amber-100 to-white transition-all duration-500 ease-out"
          style={{ height: `${percentage}%` }}
        />

        {/* Embedded Clean Score Badge Overlaid on the Bar */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 px-1 py-0.5 rounded font-mono text-[8px] sm:text-[9px] font-bold shadow-md whitespace-nowrap z-10 transition-all ${
            isWhiteAdvantage
              ? 'bottom-1 bg-stone-900/90 text-amber-300 border border-amber-400/40'
              : 'top-1 bg-stone-900/90 text-stone-200 border border-stone-700'
          }`}
        >
          {displayScore}
        </div>
      </div>
    </div>
  );
};
