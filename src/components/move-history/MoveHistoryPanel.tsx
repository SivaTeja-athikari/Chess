import React, { useEffect, useRef, useState } from 'react';
import { useChessStore } from '../../stores/useChessStore';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Copy, 
  Check, 
  FileText,
  Clock
} from 'lucide-react';

export const MoveHistoryPanel: React.FC = () => {
  const { history, viewingMoveIndex, jumpToMove, game } = useChessStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedPGN, setCopiedPGN] = useState(false);
  const [copiedFEN, setCopiedFEN] = useState(false);

  const movePairs = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      whiteIndex: i,
      whiteMove: history[i],
      blackIndex: i + 1 < history.length ? i + 1 : null,
      blackMove: i + 1 < history.length ? history[i + 1] : null,
    });
  }

  useEffect(() => {
    if (viewingMoveIndex === null && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length, viewingMoveIndex]);

  const handleCopyPGN = () => {
    const pgn = game.pgn();
    navigator.clipboard.writeText(pgn || 'No moves played yet.');
    setCopiedPGN(true);
    setTimeout(() => setCopiedPGN(false), 2000);
  };

  const handleCopyFEN = () => {
    const fen = game.fen();
    navigator.clipboard.writeText(fen);
    setCopiedFEN(true);
    setTimeout(() => setCopiedFEN(false), 2000);
  };

  const currentIndex = viewingMoveIndex ?? history.length - 1;

  return (
    <div className="flex flex-col h-full rounded-2xl glass-panel border border-stone-800/80 overflow-hidden shadow-xl">
      {/* Header with Export Options */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800/80 bg-stone-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-xs sm:text-sm text-stone-200">
            Notation & Replay
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyFEN}
            className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 hover:text-white transition-colors"
            title="Copy FEN to clipboard"
          >
            {copiedFEN ? <Check className="w-3 h-3 text-emerald-400" /> : null}
            <span>{copiedFEN ? 'Copied' : 'FEN'}</span>
          </button>

          <button
            onClick={handleCopyPGN}
            className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/30 transition-colors"
            title="Copy PGN notation to clipboard"
          >
            {copiedPGN ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedPGN ? 'Copied' : 'PGN'}</span>
          </button>
        </div>
      </div>

      {/* Move List */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-[140px] overflow-y-auto p-2.5 space-y-1 font-mono text-xs sm:text-sm"
      >
        {movePairs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-stone-500 py-8 text-xs text-center space-y-1">
            <span>Awaiting opening moves...</span>
            <span className="text-[10px] text-stone-600">Moves will appear here in SAN notation</span>
          </div>
        ) : (
          movePairs.map((pair) => (
            <div
              key={pair.moveNumber}
              className="grid grid-cols-[38px_1fr_1fr] items-center rounded-xl px-2 py-1 hover:bg-stone-800/40 transition-colors"
            >
              {/* Move Number */}
              <span className="text-stone-500 text-xs font-semibold">
                {pair.moveNumber}.
              </span>

              {/* White Move */}
              <button
                onClick={() => jumpToMove(pair.whiteIndex)}
                className={`text-left px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  currentIndex === pair.whiteIndex
                    ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <span>{pair.whiteMove.san}</span>
                {pair.whiteMove.isCheckmate ? (
                  <span className="text-[10px] text-amber-400">#</span>
                ) : pair.whiteMove.isCheck ? (
                  <span className="text-[10px] text-red-400">+</span>
                ) : null}
              </button>

              {/* Black Move */}
              {pair.blackMove ? (
                <button
                  onClick={() => jumpToMove(pair.blackIndex!)}
                  className={`text-left px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    currentIndex === pair.blackIndex
                      ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <span>{pair.blackMove.san}</span>
                  {pair.blackMove.isCheckmate ? (
                    <span className="text-[10px] text-amber-400">#</span>
                  ) : pair.blackMove.isCheck ? (
                    <span className="text-[10px] text-red-400">+</span>
                  ) : null}
                </button>
              ) : (
                <span />
              )}
            </div>
          ))
        )}
      </div>

      {/* Stepping Replay Controls Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-stone-800/80 bg-stone-900/60 backdrop-blur-md">
        <button
          onClick={() => jumpToMove(history.length > 0 ? 0 : null)}
          disabled={history.length === 0 || currentIndex === 0}
          className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Jump to Game Start"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => jumpToMove(currentIndex > 0 ? currentIndex - 1 : null)}
          disabled={history.length === 0 || currentIndex <= 0}
          className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Previous Move"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-[11px] font-mono text-stone-400">
          Move {currentIndex >= 0 ? currentIndex + 1 : 0} / {history.length}
        </span>

        <button
          onClick={() => jumpToMove(currentIndex < history.length - 1 ? currentIndex + 1 : null)}
          disabled={history.length === 0 || currentIndex >= history.length - 1}
          className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Next Move"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => jumpToMove(null)}
          disabled={viewingMoveIndex === null}
          className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Resume Live Position"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
