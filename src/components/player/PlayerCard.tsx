import React, { useEffect } from 'react';
import { Color, PieceType, PlayerProfile } from '../../types/chess';
import { useChessStore } from '../../stores/useChessStore';
import { ChessPiece2D } from '../chess-pieces/ChessPiece2D';
import { Clock, Bot, User, BrainCircuit } from 'lucide-react';

interface PlayerCardProps {
  color: Color;
  profile: PlayerProfile;
  isCurrentTurn: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  color,
  profile,
  isCurrentTurn,
}) => {
  const {
    whiteTime,
    blackTime,
    timeLimit,
    decrementTimer,
    isTimerActive,
    capturedPieces,
    isAiThinking,
  } = useChessStore();

  const isWhite = color === 'w';
  const timeRemaining = isWhite ? whiteTime : blackTime;

  useEffect(() => {
    if (!isTimerActive || !isCurrentTurn || timeLimit === null) return;

    const timer = setInterval(() => {
      decrementTimer(color);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive, isCurrentTurn, timeLimit, color, decrementTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining <= 30 && timeLimit !== null;

  const capturedList = isWhite ? capturedPieces.b : capturedPieces.w;
  const scoreDiff = isWhite ? capturedPieces.scoreDiff : -capturedPieces.scoreDiff;

  const groupedCaptured = capturedList.reduce<Record<PieceType, number>>(
    (acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<PieceType, number>
  );

  return (
    <div
      className={`relative w-full h-[46px] sm:h-[48px] flex items-center justify-between px-3 sm:px-3.5 rounded-xl transition-all duration-300 shadow-md ${
        isCurrentTurn
          ? 'glass-panel-gold border-amber-400/50 shadow-gold-glow'
          : 'glass-panel border-stone-800/80'
      }`}
    >
      {/* Player Identity */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 mr-2">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-inner transition-transform ${
              isCurrentTurn ? 'scale-105' : ''
            } ${
              isWhite
                ? 'bg-gradient-to-br from-amber-100 via-stone-200 to-stone-400 text-stone-900 border border-amber-200/80'
                : 'bg-gradient-to-br from-stone-800 via-stone-900 to-black text-stone-100 border border-stone-700/80'
            }`}
          >
            {profile.isAI ? (
              <Bot className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <User className="w-3.5 h-3.5 text-stone-300" />
            )}
          </div>

          {isCurrentTurn && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 border border-[#0a0b0e]"></span>
            </span>
          )}
        </div>

        {/* Name, Tag, and Captured */}
        <div className="flex flex-col justify-center min-w-0 leading-tight">
          <div className="flex items-center gap-1.5 truncate">
            <span
              className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold uppercase shrink-0 ${
                profile.title === 'GM'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-stone-800 text-stone-300 border border-stone-700'
              }`}
            >
              {profile.title || (isWhite ? 'W' : 'B')}
            </span>

            <span className="font-semibold text-xs sm:text-sm text-stone-100 tracking-tight truncate max-w-[110px] sm:max-w-[170px]">
              {profile.name}
            </span>

            <span className="text-[10px] font-mono text-stone-400 shrink-0">
              ({profile.rating})
            </span>

            {profile.isAI && isAiThinking && isCurrentTurn && (
              <span className="hidden sm:flex items-center gap-1 text-[10px] text-amber-400 font-medium animate-pulse ml-1 shrink-0">
                <BrainCircuit className="w-3 h-3" />
                Thinking...
              </span>
            )}
          </div>

          {/* Captured Pieces List (Single compact row) */}
          <div className="flex items-center gap-1 h-3.5 mt-0.5 overflow-hidden">
            {(Object.keys(groupedCaptured) as PieceType[]).map((type) => (
              <div
                key={type}
                className="flex items-center gap-0.5 px-0.5 rounded bg-black/40 border border-white/5"
              >
                <div className="w-2.5 h-2.5">
                  <ChessPiece2D type={type} color={isWhite ? 'b' : 'w'} />
                </div>
                {groupedCaptured[type] > 1 && (
                  <span className="text-[8px] font-mono text-stone-400 leading-none">
                    ×{groupedCaptured[type]}
                  </span>
                )}
              </div>
            ))}
            {scoreDiff > 0 && (
              <span className="text-[9px] font-mono font-extrabold text-amber-400 ml-0.5">
                +{scoreDiff}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Clock Display Badge */}
      {timeLimit !== null && (
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs sm:text-sm font-extrabold border transition-colors shadow-inner shrink-0 ${
            isLowTime
              ? 'bg-red-950/80 border-red-500 text-red-400 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.3)]'
              : isCurrentTurn
              ? 'bg-amber-950/50 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
              : 'bg-stone-900/90 border-stone-800 text-stone-200'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${isLowTime ? 'text-red-400' : 'text-amber-400'}`} />
          <span className="tracking-wider">{formatTime(timeRemaining)}</span>
        </div>
      )}
    </div>
  );
};
