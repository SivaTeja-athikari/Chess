import { create } from 'zustand';
import { Chess, Square } from 'chess.js';
import { 
  AIDifficulty, 
  BoardThemeId, 
  CapturedPiecesState, 
  Color, 
  GameMode, 
  GameStatus, 
  MoveRecord, 
  MultiplayerRoom, 
  PieceType, 
  PlayerProfile,
  CombatDuelEvent 
} from '../types/chess';
import { sound } from '../services/soundEngine';
import { aiEngine } from '../engine/stockfish/aiEngine';
import { PUZZLES_DATABASE } from '../services/puzzleBook';
import { OPENINGS_DATABASE } from '../services/openingBook';
import { multiplayer } from '../services/multiplayerEngine';
import confetti from 'canvas-confetti';

interface PendingPromotion {
  from: Square;
  to: Square;
}

interface ChessState {
  // Game instance & core representation
  game: Chess;
  fen: string;
  turn: Color;
  status: GameStatus;
  winner: Color | 'draw' | null;
  history: MoveRecord[];
  viewingMoveIndex: number | null;

  // Interactivity
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  pendingPromotion: PendingPromotion | null;

  // Game configuration
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  aiColor: Color;
  isAiThinking: boolean;
  playerWhite: PlayerProfile;
  playerBlack: PlayerProfile;

  // Local Play Options
  autoFlipLocal: boolean;
  toggleAutoFlipLocal: () => void;

  // Online Multiplayer
  multiplayerRoom: MultiplayerRoom | null;
  createMultiplayerRoom: (timeLimit?: number) => string;
  joinMultiplayerRoom: (code: string) => Promise<boolean>;
  leaveMultiplayerRoom: () => void;

  // Clocks
  timeLimit: number | null;
  whiteTime: number;
  blackTime: number;
  isTimerActive: boolean;

  // Customization & Views
  boardTheme: BoardThemeId;
  viewMode: '2d' | '3d';
  orientation: Color;
  isMuted: boolean;
  soundVolume: number;

  // Cinematic Combat Duel System
  cinematicBattleMode: boolean;
  activeCombat: CombatDuelEvent | null;
  toggleCinematicBattleMode: () => void;
  clearActiveCombat: () => void;

  // Captured pieces & metrics
  capturedPieces: CapturedPiecesState;

  // Puzzles & Openings
  currentPuzzleId: string | null;
  puzzleState: 'solving' | 'solved' | 'failed';
  puzzleMoveStep: number;

  currentOpeningId: string | null;
  openingMoveStep: number;

  // Action methods
  selectSquare: (sq: Square) => void;
  makeMove: (from: Square, to: Square, promotion?: PieceType, isLocal?: boolean) => boolean;
  confirmPromotion: (piece: PieceType) => void;
  cancelPromotion: () => void;
  undoMove: () => void;
  redoMove: () => void;
  restartGame: (isLocal?: boolean) => void;
  resign: (color: Color, isLocal?: boolean) => void;
  flipBoard: () => void;
  setGameMode: (mode: GameMode) => void;
  setAIDifficulty: (diff: AIDifficulty) => void;
  setBoardTheme: (theme: BoardThemeId) => void;
  setViewMode: (view: '2d' | '3d') => void;
  setSoundMuted: (muted: boolean) => void;
  setSoundVolume: (vol: number) => void;
  jumpToMove: (index: number | null) => void;
  loadPuzzle: (id: string) => void;
  loadOpening: (id: string) => void;
  decrementTimer: (color: Color) => void;
  triggerAIIfTurn: () => Promise<void>;
}

const DEFAULT_WHITE_PLAYER: PlayerProfile = {
  id: 'p1',
  name: 'Grandmaster (You)',
  avatar: '♔',
  title: 'GM',
  rating: 2450,
  country: 'Global',
};

const DEFAULT_BLACK_AI: PlayerProfile = {
  id: 'ai-bot',
  name: 'Stockfish AI',
  avatar: '🤖',
  title: 'BOT',
  rating: 1600,
  country: 'Cloud',
  isAI: true,
  difficulty: 'intermediate',
};

function calculateCapturedPieces(game: Chess): CapturedPiecesState {
  const pieces = { p: 8, n: 2, b: 2, r: 2, q: 1 };
  const values: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  
  const currentBoard = game.board();
  const whiteOnBoard: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
  const blackOnBoard: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = currentBoard[r][c];
      if (p) {
        if (p.color === 'w') whiteOnBoard[p.type]++;
        else blackOnBoard[p.type]++;
      }
    }
  }

  const whiteCaptured: PieceType[] = [];
  const blackCaptured: PieceType[] = [];
  let scoreDiff = 0;

  (Object.keys(pieces) as (keyof typeof pieces)[]).forEach((type) => {
    const totalExpected = pieces[type];
    const missingWhite = totalExpected - (whiteOnBoard[type] || 0);
    const missingBlack = totalExpected - (blackOnBoard[type] || 0);

    for (let i = 0; i < missingWhite; i++) whiteCaptured.push(type);
    for (let i = 0; i < missingBlack; i++) blackCaptured.push(type);
  });

  whiteCaptured.forEach((t) => (scoreDiff -= values[t]));
  blackCaptured.forEach((t) => (scoreDiff += values[t]));

  return {
    w: whiteCaptured,
    b: blackCaptured,
    scoreDiff,
  };
}

export const useChessStore = create<ChessState>((set, get) => {
  const initialGame = new Chess();

  return {
    game: initialGame,
    fen: initialGame.fen(),
    turn: 'w',
    status: 'idle',
    winner: null,
    history: [],
    viewingMoveIndex: null,

    selectedSquare: null,
    legalMoves: [],
    lastMove: null,
    pendingPromotion: null,

    gameMode: 'pve',
    aiDifficulty: 'intermediate',
    aiColor: 'b',
    isAiThinking: false,
    playerWhite: DEFAULT_WHITE_PLAYER,
    playerBlack: DEFAULT_BLACK_AI,

    autoFlipLocal: false,
    toggleAutoFlipLocal: () => {
      set((state) => ({ autoFlipLocal: !state.autoFlipLocal }));
    },

    multiplayerRoom: null,
    createMultiplayerRoom: (timeLimit = 600) => {
      const code = `GM-${Math.floor(1000 + Math.random() * 9000)}`;
      const room: MultiplayerRoom = {
        code,
        hostName: 'You (White)',
        status: 'waiting',
        playerColor: 'w',
        timeLimit,
      };
      set({
        multiplayerRoom: room,
        gameMode: 'pvp-online',
        orientation: 'w',
        playerWhite: { id: 'host', name: 'You (White)', avatar: '♔', rating: 1850, country: 'Host' },
        playerBlack: { id: 'guest', name: 'Awaiting Player...', avatar: '⏳', rating: 1800, country: 'Online' },
      });
      get().restartGame();

      multiplayer.createRoom(code, 'Host Player', timeLimit, {
        onConnected: (_id, opponentName) => {
          set((s) => ({
            multiplayerRoom: s.multiplayerRoom
              ? { ...s.multiplayerRoom, status: 'playing', opponentName }
              : null,
            playerBlack: {
              id: 'guest',
              name: opponentName || 'Challenger',
              avatar: '⚔️',
              rating: 1850,
              country: 'Guest',
            },
          }));
          confetti({ particleCount: 70, spread: 60 });
        },
        onMoveReceived: (from, to, promotion, wt, bt) => {
          get().makeMove(from, to, promotion, false);
          if (wt !== undefined && bt !== undefined) {
            set({ whiteTime: wt, blackTime: bt });
          }
        },
        onOpponentResigned: (color) => {
          get().resign(color);
        },
        onRestartRequested: () => {
          get().restartGame();
        },
        onDisconnected: () => {
          set((s) => ({
            multiplayerRoom: s.multiplayerRoom
              ? { ...s.multiplayerRoom, status: 'waiting' }
              : null,
            playerBlack: {
              id: 'guest',
              name: 'Player Disconnected',
              avatar: '⏳',
              rating: 1800,
              country: 'Offline',
            },
          }));
        },
      }).catch(() => {});

      return code;
    },

    joinMultiplayerRoom: async (code: string) => {
      if (!code || code.length < 4) return false;
      const room: MultiplayerRoom = {
        code,
        hostName: 'Connecting...',
        opponentName: 'You (Black)',
        status: 'waiting',
        playerColor: 'b',
        timeLimit: 600,
      };
      set({
        multiplayerRoom: room,
        gameMode: 'pvp-online',
        orientation: 'b',
        playerWhite: { id: 'host', name: 'Host Player', avatar: '♔', rating: 1920, country: 'Online' },
        playerBlack: { id: 'guest', name: 'You (Black)', avatar: '⚔️', rating: 1850, country: 'Challenger' },
      });
      get().restartGame();

      try {
        await multiplayer.joinRoom(code, 'Guest Player', {
          onConnected: (_id, hostName) => {
            set((s) => ({
              multiplayerRoom: s.multiplayerRoom
                ? { ...s.multiplayerRoom, status: 'playing', hostName }
                : null,
              playerWhite: {
                id: 'host',
                name: hostName || 'Host Challenger',
                avatar: '♔',
                rating: 1920,
                country: 'Host',
              },
            }));
            confetti({ particleCount: 80, spread: 60 });
          },
          onMoveReceived: (from, to, promotion, wt, bt) => {
            get().makeMove(from, to, promotion, false);
            if (wt !== undefined && bt !== undefined) {
              set({ whiteTime: wt, blackTime: bt });
            }
          },
          onOpponentResigned: (color) => {
            get().resign(color);
          },
          onRestartRequested: () => {
            get().restartGame();
          },
          onDisconnected: () => {
            set((s) => ({
              multiplayerRoom: s.multiplayerRoom
                ? { ...s.multiplayerRoom, status: 'waiting' }
                : null,
            }));
          },
        });
        return true;
      } catch {
        return false;
      }
    },

    leaveMultiplayerRoom: () => {
      multiplayer.leaveRoom();
      set({ multiplayerRoom: null });
      get().setGameMode('pve');
    },

    timeLimit: 600,
    whiteTime: 600,
    blackTime: 600,
    isTimerActive: false,

    boardTheme: 'royal-wood',
    viewMode: '2d',
    orientation: 'w',
    isMuted: false,
    soundVolume: 0.7,

    cinematicBattleMode: true,
    activeCombat: null,
    toggleCinematicBattleMode: () => set((s) => ({ cinematicBattleMode: !s.cinematicBattleMode })),
    clearActiveCombat: () => set({ activeCombat: null }),

    capturedPieces: { w: [], b: [], scoreDiff: 0 },

    currentPuzzleId: null,
    puzzleState: 'solving',
    puzzleMoveStep: 0,

    currentOpeningId: null,
    openingMoveStep: 0,

    selectSquare: (sq: Square) => {
      const { 
        game, 
        selectedSquare, 
        makeMove, 
        turn, 
        gameMode, 
        aiColor, 
        isAiThinking, 
        viewingMoveIndex, 
        activeCombat,
        multiplayerRoom 
      } = get();

      if (activeCombat) {
        set({ activeCombat: null });
      }

      if (viewingMoveIndex !== null || isAiThinking) return;
      if (gameMode === 'pve' && turn === aiColor) return;
      if (gameMode === 'pvp-online' && multiplayerRoom && turn !== multiplayerRoom.playerColor) return;

      const piece = game.get(sq);

      if (selectedSquare) {
        if (selectedSquare === sq) {
          set({ selectedSquare: null, legalMoves: [] });
          sound.playClick();
          return;
        }

        const moves = game.moves({ square: selectedSquare, verbose: true });
        const targetMove = moves.find((m) => m.to === sq);

        if (targetMove) {
          const pieceAtSource = game.get(selectedSquare);
          const isPawnPromotion =
            pieceAtSource?.type === 'p' &&
            ((pieceAtSource.color === 'w' && sq.endsWith('8')) ||
              (pieceAtSource.color === 'b' && sq.endsWith('1')));

          if (isPawnPromotion) {
            set({ pendingPromotion: { from: selectedSquare, to: sq }, selectedSquare: null, legalMoves: [] });
            return;
          }

          makeMove(selectedSquare, sq, 'q', true);
          return;
        }
      }

      if (piece && piece.color === turn) {
        if (gameMode === 'pvp-online' && multiplayerRoom && piece.color !== multiplayerRoom.playerColor) {
          return;
        }
        const moves = game.moves({ square: sq, verbose: true });
        const destinations = moves.map((m) => m.to as Square);
        set({ selectedSquare: sq, legalMoves: destinations });
        sound.playClick();
      } else {
        set({ selectedSquare: null, legalMoves: [] });
      }
    },

    makeMove: (from: Square, to: Square, promotion: PieceType = 'q', isLocal: boolean = true) => {
      const { 
        game, 
        history, 
        triggerAIIfTurn, 
        gameMode, 
        currentPuzzleId, 
        puzzleMoveStep,
        autoFlipLocal,
        multiplayerRoom 
      } = get();

      if (gameMode === 'pvp-online' && isLocal && multiplayerRoom && game.turn() !== multiplayerRoom.playerColor) {
        return false;
      }

      try {
        const pieceAtDest = game.get(to);
        const movingPiece = game.get(from);
        const isEnPassant = movingPiece?.type === 'p' && !pieceAtDest && from[0] !== to[0];

        const move = game.move({ from, to, promotion });
        if (!move) return false;

        let combatEvent: CombatDuelEvent | null = null;
        if (move.captured) {
          const victimColor = move.color === 'w' ? 'b' : 'w';
          const victimType = (move.captured as PieceType) || 'p';
          const attackerType = move.piece as PieceType;

          sound.playCombatClash(attackerType, victimType);

          if (get().cinematicBattleMode) {
            combatEvent = {
              id: `${Date.now()}-${from}-${to}`,
              attackerColor: move.color,
              attackerType,
              victimColor,
              victimType,
              square: to,
              fromSquare: from,
              san: move.san,
              isEnPassant,
              timestamp: Date.now(),
            };
          }
        } else if (move.flags.includes('k') || move.flags.includes('q')) {
          sound.playCastle();
        } else {
          sound.playMove();
        }

        let newStatus: GameStatus = 'in_progress';
        let winner: Color | 'draw' | null = null;

        if (game.isCheckmate()) {
          newStatus = 'checkmate';
          winner = move.color;
          sound.playCheckmate();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } else if (game.isCheck()) {
          newStatus = 'check';
          sound.playCheck();
        } else if (game.isStalemate()) {
          newStatus = 'stalemate';
          winner = 'draw';
        } else if (game.isThreefoldRepetition()) {
          newStatus = 'draw_repetition';
          winner = 'draw';
        } else if (game.isInsufficientMaterial()) {
          newStatus = 'draw_insufficient_material';
          winner = 'draw';
        }

        const newRecord: MoveRecord = {
          from,
          to,
          san: move.san,
          fen: game.fen(),
          color: move.color,
          captured: move.captured as PieceType | undefined,
          promotion: move.promotion as PieceType | undefined,
          isCheck: game.isCheck(),
          isCheckmate: game.isCheckmate(),
          timestamp: Date.now(),
        };

        const updatedHistory = [...history, newRecord];
        const captured = calculateCapturedPieces(game);

        // Auto-flip for local play
        let newOrientation = get().orientation;
        if (gameMode === 'pvp-local' && autoFlipLocal && !game.isGameOver()) {
          newOrientation = game.turn();
        }

        set({
          fen: game.fen(),
          turn: game.turn(),
          status: newStatus,
          winner,
          history: updatedHistory,
          selectedSquare: null,
          legalMoves: [],
          lastMove: { from, to },
          activeCombat: combatEvent !== null ? combatEvent : get().activeCombat,
          pendingPromotion: null,
          isTimerActive: !game.isGameOver(),
          capturedPieces: captured,
          viewingMoveIndex: null,
          orientation: newOrientation,
        });

        // Broadcast over WebRTC if online multiplayer move made locally
        if (gameMode === 'pvp-online' && isLocal) {
          multiplayer.sendMove(from, to, promotion, get().whiteTime, get().blackTime);
        }

        // Handle puzzle mode progression
        if (gameMode === 'puzzle' && currentPuzzleId) {
          const puzzle = PUZZLES_DATABASE.find((p) => p.id === currentPuzzleId);
          if (puzzle) {
            const expectedMove = puzzle.solutionMoves[puzzleMoveStep];
            if (move.san === expectedMove || `${from}${to}` === expectedMove) {
              const nextStep = puzzleMoveStep + 1;
              if (nextStep >= puzzle.solutionMoves.length) {
                set({ puzzleState: 'solved' });
                sound.playCheckmate();
                confetti({ particleCount: 80, spread: 60 });
              } else {
                set({ puzzleMoveStep: nextStep });
              }
            } else {
              set({ puzzleState: 'failed' });
            }
          }
        }

        // Trigger AI response if playing vs computer
        if (gameMode === 'pve' && !game.isGameOver()) {
          setTimeout(() => {
            triggerAIIfTurn();
          }, 80);
        }

        return true;
      } catch (err) {
        console.warn('Illegal move attempt rejected:', err);
        return false;
      }
    },

    confirmPromotion: (piece: PieceType) => {
      const { pendingPromotion, makeMove } = get();
      if (!pendingPromotion) return;
      makeMove(pendingPromotion.from, pendingPromotion.to, piece, true);
    },

    cancelPromotion: () => {
      set({ pendingPromotion: null, selectedSquare: null, legalMoves: [] });
    },

    triggerAIIfTurn: async () => {
      const { game, gameMode, aiColor, aiDifficulty, makeMove, isAiThinking } = get();
      if (gameMode !== 'pve' || game.turn() !== aiColor || game.isGameOver() || isAiThinking) return;

      set({ isAiThinking: true });

      try {
        const bestMove = await aiEngine.getBestMove(game.fen(), aiDifficulty);
        const current = get();
        if (
          current.gameMode === 'pve' &&
          current.game.turn() === current.aiColor &&
          !current.game.isGameOver() &&
          bestMove
        ) {
          makeMove(bestMove.from as Square, bestMove.to as Square, (bestMove.promotion || 'q') as PieceType);
        }
      } catch (err) {
        console.error('AI engine error:', err);
      } finally {
        set({ isAiThinking: false });
      }
    },

    undoMove: () => {
      const { game, history, gameMode } = get();
      if (history.length === 0 || gameMode !== 'pve') return;

      const stepsToUndo = history.length >= 2 ? 2 : 1;

      for (let i = 0; i < stepsToUndo; i++) {
        game.undo();
      }

      const newHistory = history.slice(0, history.length - stepsToUndo);
      const last = newHistory[newHistory.length - 1];

      set({
        fen: game.fen(),
        turn: game.turn(),
        status: game.isCheck() ? 'check' : 'in_progress',
        winner: null,
        history: newHistory,
        selectedSquare: null,
        legalMoves: [],
        lastMove: last ? { from: last.from, to: last.to } : null,
        capturedPieces: calculateCapturedPieces(game),
        viewingMoveIndex: null,
        isAiThinking: false,
      });
      sound.playClick();
    },

    redoMove: () => {
      const { viewingMoveIndex, history } = get();
      if (viewingMoveIndex === null || viewingMoveIndex >= history.length - 1) return;
      get().jumpToMove(viewingMoveIndex + 1);
    },

    restartGame: (isLocal: boolean = true) => {
      const newGame = new Chess();
      const { timeLimit, gameMode } = get();
      set({
        game: newGame,
        fen: newGame.fen(),
        turn: 'w',
        status: 'idle',
        winner: null,
        history: [],
        viewingMoveIndex: null,
        selectedSquare: null,
        legalMoves: [],
        lastMove: null,
        pendingPromotion: null,
        whiteTime: timeLimit || 600,
        blackTime: timeLimit || 600,
        isTimerActive: false,
        capturedPieces: { w: [], b: [], scoreDiff: 0 },
        isAiThinking: false,
        puzzleState: 'solving',
        puzzleMoveStep: 0,
      });
      sound.playClick();
      if (gameMode === 'pvp-online' && isLocal) {
        multiplayer.sendRestart();
      }
    },

    resign: (color: Color, isLocal: boolean = true) => {
      const winner = color === 'w' ? 'b' : 'w';
      set({
        status: 'resigned',
        winner,
        isTimerActive: false,
      });
      sound.playCheckmate();
      if (get().gameMode === 'pvp-online' && isLocal) {
        multiplayer.sendResign(color);
      }
    },

    flipBoard: () => {
      set((state) => ({ orientation: state.orientation === 'w' ? 'b' : 'w' }));
      sound.playClick();
    },

    setGameMode: (mode: GameMode) => {
      if (mode === 'pvp-local') {
        set({
          playerWhite: { id: 'p1', name: 'Player 1 (White)', avatar: '♔', title: 'P1', rating: 1500, country: 'Local' },
          playerBlack: { id: 'p2', name: 'Player 2 (Black)', avatar: '♚', title: 'P2', rating: 1500, country: 'Local' },
        });
      } else if (mode === 'pve') {
        set({
          playerWhite: DEFAULT_WHITE_PLAYER,
          playerBlack: DEFAULT_BLACK_AI,
        });
      }
      set({ gameMode: mode });
      get().restartGame();
    },

    setAIDifficulty: (diff: AIDifficulty) => {
      set({
        aiDifficulty: diff,
        playerBlack: {
          ...get().playerBlack,
          difficulty: diff,
        },
      });
    },

    setBoardTheme: (theme: BoardThemeId) => {
      set({ boardTheme: theme });
    },

    setViewMode: (view: '2d' | '3d') => {
      set({ viewMode: view });
    },

    setSoundMuted: (muted: boolean) => {
      sound.setMuted(muted);
      set({ isMuted: muted });
    },

    setSoundVolume: (vol: number) => {
      sound.setVolume(vol);
      set({ soundVolume: vol });
    },

    jumpToMove: (index: number | null) => {
      const { history } = get();
      if (index === null || index >= history.length - 1) {
        const liveGame = new Chess();
        history.forEach((m) => liveGame.move({ from: m.from, to: m.to, promotion: m.promotion }));
        const last = history[history.length - 1];

        set({
          viewingMoveIndex: null,
          fen: liveGame.fen(),
          lastMove: last ? { from: last.from, to: last.to } : null,
          selectedSquare: null,
          legalMoves: [],
        });
      } else {
        const replayGame = new Chess();
        for (let i = 0; i <= index; i++) {
          replayGame.move({
            from: history[i].from,
            to: history[i].to,
            promotion: history[i].promotion,
          });
        }
        const targetMove = history[index];
        set({
          viewingMoveIndex: index,
          fen: replayGame.fen(),
          lastMove: { from: targetMove.from, to: targetMove.to },
          selectedSquare: null,
          legalMoves: [],
        });
      }
      sound.playClick();
    },

    loadPuzzle: (id: string) => {
      const puzzle = PUZZLES_DATABASE.find((p) => p.id === id);
      if (!puzzle) return;

      const pGame = new Chess(puzzle.fen);
      set({
        game: pGame,
        fen: pGame.fen(),
        turn: pGame.turn(),
        status: 'in_progress',
        winner: null,
        history: [],
        viewingMoveIndex: null,
        selectedSquare: null,
        legalMoves: [],
        lastMove: null,
        gameMode: 'puzzle',
        currentPuzzleId: id,
        puzzleState: 'solving',
        puzzleMoveStep: 0,
        orientation: puzzle.turn,
        capturedPieces: calculateCapturedPieces(pGame),
      });
      sound.playClick();
    },

    loadOpening: (id: string) => {
      const opening = OPENINGS_DATABASE.find((o) => o.id === id);
      if (!opening) return;

      const oGame = new Chess();
      const records: MoveRecord[] = [];

      opening.moves.forEach((san) => {
        const move = oGame.move(san);
        if (move) {
          records.push({
            from: move.from as Square,
            to: move.to as Square,
            san: move.san,
            fen: oGame.fen(),
            color: move.color,
            captured: move.captured as PieceType | undefined,
            promotion: move.promotion as PieceType | undefined,
            isCheck: oGame.isCheck(),
            isCheckmate: oGame.isCheckmate(),
            timestamp: Date.now(),
          });
        }
      });

      set({
        game: oGame,
        fen: oGame.fen(),
        turn: oGame.turn(),
        status: 'in_progress',
        winner: null,
        history: records,
        viewingMoveIndex: null,
        selectedSquare: null,
        legalMoves: [],
        lastMove: records[records.length - 1] ? { from: records[records.length - 1].from, to: records[records.length - 1].to } : null,
        gameMode: 'openings',
        currentOpeningId: id,
        openingMoveStep: records.length,
        capturedPieces: calculateCapturedPieces(oGame),
      });
      sound.playClick();
    },

    decrementTimer: (color: Color) => {
      const { whiteTime, blackTime, isTimerActive } = get();
      if (!isTimerActive) return;

      if (color === 'w') {
        const newTime = Math.max(0, whiteTime - 1);
        set({ whiteTime: newTime });
        if (newTime === 0) {
          set({ status: 'timeout', winner: 'b', isTimerActive: false });
          sound.playCheckmate();
        }
      } else {
        const newTime = Math.max(0, blackTime - 1);
        set({ blackTime: newTime });
        if (newTime === 0) {
          set({ status: 'timeout', winner: 'w', isTimerActive: false });
          sound.playCheckmate();
        }
      }
    },
  };
});
