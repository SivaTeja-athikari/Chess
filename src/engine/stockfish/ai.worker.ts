import { Chess, Move } from 'chess.js';
import { AIDifficulty } from '../../types/chess';
import { evaluateBoard } from '../chess-engine/evaluation';

// Master grandmaster opening responses for fast, natural opening play
const OPENING_BOOK: Record<string, string[]> = {
  // After 1. e4
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1': [
    'c7c5', // Sicilian
    'e7e5', // Open Game
    'e7e6', // French
    'c7c6', // Caro-Kann
    'g8f6', // Alekhine
  ],
  // After 1. d4
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1': [
    'g8f6', // Indian
    'd7d5', // Queen's Gambit
    'e7e6', 
    'c7c5',
  ],
  // After 1. c4
  'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1': [
    'e7e5',
    'g8f6',
    'c7c5',
  ],
  // After 1. Nf3
  'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1': [
    'd7d5',
    'g8f6',
    'c7c5',
  ],
  // 1. e4 e5 2. Nf3
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2': [
    'b8c6', // 2... Nc6
    'g8f6', // Petroff
  ],
  // 1. e4 c5 2. Nf3
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2': [
    'd7d6', // Najdorf/Dragon prep
    'b8c6',
    'e7e6',
  ],
  // 1. d4 Nf6 2. c4
  'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2': [
    'e7e6',
    'g7g6', // King's Indian
    'c7c5', // Benoni
  ],
  // 1. d4 d5 2. c4
  'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2': [
    'e7e6', // QGD
    'c7c6', // Slav
    'd5c4', // QGA
  ],
};

function getDifficultyConfig(diff: AIDifficulty): { maxDepth: number; timeBudgetMs: number; blunderRate: number } {
  switch (diff) {
    case 'beginner':
      return { maxDepth: 1, timeBudgetMs: 200, blunderRate: 0.35 };
    case 'easy':
      return { maxDepth: 2, timeBudgetMs: 300, blunderRate: 0.15 };
    case 'intermediate':
      return { maxDepth: 3, timeBudgetMs: 500, blunderRate: 0.05 };
    case 'advanced':
      return { maxDepth: 4, timeBudgetMs: 800, blunderRate: 0.0 };
    case 'expert':
      return { maxDepth: 4, timeBudgetMs: 1100, blunderRate: 0.0 };
    case 'master':
      return { maxDepth: 5, timeBudgetMs: 1400, blunderRate: 0.0 };
  }
}

function searchTimed(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  startTime: number,
  timeBudgetMs: number
): number {
  if (Date.now() - startTime > timeBudgetMs) {
    return isMaximizing ? -Infinity : Infinity;
  }

  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.moves({ verbose: true });
  // Order captures first
  moves.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const score = searchTimed(game, depth - 1, alpha, beta, false, startTime, timeBudgetMs);
      game.undo();
      maxEval = Math.max(maxEval, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
      if (Date.now() - startTime > timeBudgetMs) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const score = searchTimed(game, depth - 1, alpha, beta, true, startTime, timeBudgetMs);
      game.undo();
      minEval = Math.min(minEval, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
      if (Date.now() - startTime > timeBudgetMs) break;
    }
    return minEval;
  }
}

self.onmessage = (e: MessageEvent<{ fen: string; difficulty: AIDifficulty }>) => {
  const { fen, difficulty } = e.data;
  const game = new Chess(fen);
  const legalMoves = game.moves({ verbose: true });

  if (legalMoves.length === 0) {
    self.postMessage(null);
    return;
  }

  // 1. Check Opening Book
  if (OPENING_BOOK[fen]) {
    const bookMoves = OPENING_BOOK[fen];
    const pick = bookMoves[Math.floor(Math.random() * bookMoves.length)];
    const from = pick.slice(0, 2);
    const to = pick.slice(2, 4);
    // Verify move is legal
    const verified = legalMoves.find((m) => m.from === from && m.to === to);
    if (verified) {
      self.postMessage({ from: verified.from, to: verified.to, promotion: verified.promotion });
      return;
    }
  }

  const config = getDifficultyConfig(difficulty);
  const isMax = game.turn() === 'w';

  // Occasional random blunder for lower difficulty
  if (config.blunderRate > 0 && Math.random() < config.blunderRate) {
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    self.postMessage({ from: randomMove.from, to: randomMove.to, promotion: randomMove.promotion });
    return;
  }

  const startTime = Date.now();
  let bestMove = legalMoves[0];

  // Iterative Deepening with strict Time Budget
  for (let currentDepth = 1; currentDepth <= config.maxDepth; currentDepth++) {
    let bestScoreAtDepth = isMax ? -Infinity : Infinity;
    let bestMoveAtDepth = legalMoves[0];

    // Move ordering: captures and checks prioritized
    legalMoves.sort((a, b) => {
      let scoreA = a.captured ? 100 : 0;
      let scoreB = b.captured ? 100 : 0;
      return scoreB - scoreA;
    });

    for (const move of legalMoves) {
      game.move(move);
      const score = searchTimed(
        game,
        currentDepth - 1,
        -Infinity,
        Infinity,
        !isMax,
        startTime,
        config.timeBudgetMs
      );
      game.undo();

      if (Date.now() - startTime > config.timeBudgetMs) {
        break;
      }

      if (isMax) {
        if (score > bestScoreAtDepth) {
          bestScoreAtDepth = score;
          bestMoveAtDepth = move;
        }
      } else {
        if (score < bestScoreAtDepth) {
          bestScoreAtDepth = score;
          bestMoveAtDepth = move;
        }
      }
    }

    if (Date.now() - startTime > config.timeBudgetMs) {
      break;
    }

    bestMove = bestMoveAtDepth;
  }

  self.postMessage({ from: bestMove.from, to: bestMove.to, promotion: bestMove.promotion });
};
