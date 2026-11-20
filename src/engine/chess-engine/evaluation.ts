import { Chess, Square } from 'chess.js';

// Standard piece values in centipawns
export const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// PeSTO piece square tables for positional positional nuance
const PAWN_TABLE_WHITE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE_WHITE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE_WHITE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_TABLE_WHITE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE_WHITE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_TABLE_WHITE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

function mirrorIndex(idx: number): number {
  const row = Math.floor(idx / 8);
  const col = idx % 8;
  return (7 - row) * 8 + col;
}

/**
 * Evaluates board position from White's perspective in centipawns (+ is advantage White, - is Black)
 */
export function evaluateBoard(game: Chess): number {
  if (game.isGameOver()) {
    if (game.isCheckmate()) {
      return game.turn() === 'w' ? -30000 : 30000;
    }
    return 0; // Draw
  }

  let evaluation = 0;
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const baseVal = PIECE_VALUES[piece.type] || 0;
      const idx = r * 8 + c;
      let positionalBonus = 0;

      switch (piece.type) {
        case 'p':
          positionalBonus = piece.color === 'w' ? PAWN_TABLE_WHITE[idx] : PAWN_TABLE_WHITE[mirrorIndex(idx)];
          break;
        case 'n':
          positionalBonus = piece.color === 'w' ? KNIGHT_TABLE_WHITE[idx] : KNIGHT_TABLE_WHITE[mirrorIndex(idx)];
          break;
        case 'b':
          positionalBonus = piece.color === 'w' ? BISHOP_TABLE_WHITE[idx] : BISHOP_TABLE_WHITE[mirrorIndex(idx)];
          break;
        case 'r':
          positionalBonus = piece.color === 'w' ? ROOK_TABLE_WHITE[idx] : ROOK_TABLE_WHITE[mirrorIndex(idx)];
          break;
        case 'q':
          positionalBonus = piece.color === 'w' ? QUEEN_TABLE_WHITE[idx] : QUEEN_TABLE_WHITE[mirrorIndex(idx)];
          break;
        case 'k':
          positionalBonus = piece.color === 'w' ? KING_TABLE_WHITE[idx] : KING_TABLE_WHITE[mirrorIndex(idx)];
          break;
      }

      const totalVal = baseVal + positionalBonus;
      if (piece.color === 'w') {
        evaluation += totalVal;
      } else {
        evaluation -= totalVal;
      }
    }
  }

  return evaluation;
}
