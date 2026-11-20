import React, { useMemo } from 'react';
import { useChessStore } from '../../stores/useChessStore';
import { OPENINGS_DATABASE } from '../../services/openingBook';
import { ChessPiece2D } from '../chess-pieces/ChessPiece2D';
import { PieceType } from '../../types/chess';
import { 
  BookOpen, 
  Swords, 
  ShieldAlert, 
  Award,
  Layers,
  Sparkles
} from 'lucide-react';

interface MatchIntelPanelProps {
  onOpenPuzzles?: () => void;
  onOpenOpenings?: () => void;
  onOpenGameModes?: () => void;
}

export const MatchIntelPanel: React.FC<MatchIntelPanelProps> = () => {
  const {
    turn,
    status,
    history,
    capturedPieces,
    game,
  } = useChessStore();

  // Dynamically recognize opening from move sequence
  const detectedOpening = useMemo(() => {
    if (history.length === 0) return null;
    const currentSANs = history.map((m) => m.san);

    let bestMatch = null;
    let maxMatchLen = 0;

    for (const op of OPENINGS_DATABASE) {
      let matches = 0;
      for (let i = 0; i < op.moves.length && i < currentSANs.length; i++) {
        if (op.moves[i] === currentSANs[i]) {
          matches++;
        } else {
          break;
        }
      }
      if (matches >= 2 && matches > maxMatchLen) {
        maxMatchLen = matches;
        bestMatch = op;
      }
    }

    return bestMatch;
  }, [history]);

  const whiteCaptured = capturedPieces.w;
  const blackCaptured = capturedPieces.b;
  const scoreDiff = capturedPieces.scoreDiff;

  const countPieces = (list: PieceType[]) => {
    return list.reduce<Record<PieceType, number>>((acc, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {} as Record<PieceType, number>);
  };

  const whiteGrouped = countPieces(blackCaptured); // Pieces White captured
  const blackGrouped = countPieces(whiteCaptured); // Pieces Black captured

  // Dynamic game phase estimation
  const gamePhase = useMemo(() => {
    const totalMoves = history.length;
    const piecesRemaining = 32 - (whiteCaptured.length + blackCaptured.length);
    if (totalMoves < 14 && piecesRemaining >= 28) return 'Opening Phase';
    if (piecesRemaining <= 12) return 'Endgame Phase';
    return 'Middlegame Phase';
  }, [history.length, whiteCaptured.length, blackCaptured.length]);

  return (
    <div className="w-full h-full flex flex-col justify-between gap-3 text-stone-200">
      {/* 1. Active Turn & Game Phase */}
      <div className="p-3.5 rounded-2xl glass-panel border border-stone-800/80 shadow-lg flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
              Match Intelligence
            </span>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            {gamePhase}
          </span>
        </div>

        {/* Turn Indicator */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-900/90 border border-stone-800">
          <span className="text-xs text-stone-400 font-medium">Turn Indicator</span>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                turn === 'w'
                  ? 'bg-amber-100 border border-amber-300 shadow-[0_0_8px_#fef3c7]'
                  : 'bg-stone-900 border border-stone-500'
              }`}
            />
            <span className="text-xs font-bold text-stone-100">
              {turn === 'w' ? 'White to Move' : 'Black to Move'}
            </span>
          </div>
        </div>

        {/* Quick Plies Counter & Status */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-stone-900/50 border border-stone-800/60 text-xs">
          <span className="text-stone-400">Moves Played</span>
          <span className="font-mono font-bold text-amber-300">
            {Math.floor(history.length / 2)} Full Moves ({history.length} Plies)
          </span>
        </div>

        {status === 'check' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>King is currently under check!</span>
          </div>
        )}
      </div>

      {/* 2. Opening Master Theory */}
      <div className="p-3.5 rounded-2xl glass-panel border border-stone-800/80 shadow-lg flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
            Opening Theory
          </span>
        </div>

        {detectedOpening ? (
          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-500/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-100 truncate">
                {detectedOpening.name}
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 shrink-0">
                {detectedOpening.eco}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 line-clamp-3 leading-relaxed">
              {detectedOpening.description}
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-stone-900/50 border border-stone-800/60 text-center">
            <span className="text-xs text-stone-400 font-medium">Standard Chess Setup</span>
            <p className="text-[10px] text-stone-500 mt-0.5">
              Opening will be classified as moves unfold
            </p>
          </div>
        )}
      </div>

      {/* 3. Material Advantage & Army Captures */}
      <div className="p-3.5 rounded-2xl glass-panel border border-stone-800/80 shadow-lg flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
              Material Balance
            </span>
          </div>
          {scoreDiff !== 0 ? (
            <span
              className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded-md ${
                scoreDiff > 0
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  : 'bg-stone-800 text-stone-300 border border-stone-700'
              }`}
            >
              {scoreDiff > 0 ? `White +${scoreDiff}` : `Black +${Math.abs(scoreDiff)}`}
            </span>
          ) : (
            <span className="text-[11px] font-mono text-stone-500">Even (0.0)</span>
          )}
        </div>

        <div className="space-y-1.5 text-xs">
          {/* White Army Captures */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900/60 border border-stone-800/50">
            <span className="text-stone-400 text-[11px]">White army took:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {Object.keys(whiteGrouped).length === 0 ? (
                <span className="text-[10px] text-stone-600">None</span>
              ) : (
                (Object.keys(whiteGrouped) as PieceType[]).map((type) => (
                  <div key={type} className="flex items-center gap-0.5">
                    <div className="w-3.5 h-3.5">
                      <ChessPiece2D type={type} color="b" />
                    </div>
                    {whiteGrouped[type] > 1 && (
                      <span className="text-[9px] font-mono text-stone-400">
                        {whiteGrouped[type]}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Black Army Captures */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900/60 border border-stone-800/50">
            <span className="text-stone-400 text-[11px]">Black army took:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {Object.keys(blackGrouped).length === 0 ? (
                <span className="text-[10px] text-stone-600">None</span>
              ) : (
                (Object.keys(blackGrouped) as PieceType[]).map((type) => (
                  <div key={type} className="flex items-center gap-0.5">
                    <div className="w-3.5 h-3.5">
                      <ChessPiece2D type={type} color="w" />
                    </div>
                    {blackGrouped[type] > 1 && (
                      <span className="text-[9px] font-mono text-stone-400">
                        {blackGrouped[type]}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Battlefield Combat Status */}
      <div className="p-3 rounded-2xl glass-panel border border-stone-800/80 shadow-lg flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-amber-400" />
          <div className="flex flex-col">
            <span className="font-semibold text-stone-200">Living Battle Morph</span>
            <span className="text-[10px] text-stone-400">Tactical in-board combat FX active</span>
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
      </div>
    </div>
  );
};
