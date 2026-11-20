export type Square = 
  | 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8'
  | 'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7'
  | 'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6'
  | 'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5'
  | 'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4'
  | 'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3'
  | 'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2'
  | 'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1';

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Color = 'w' | 'b';

export interface ChessPiece {
  type: PieceType;
  color: Color;
  square: Square;
}

export type GameMode = 
  | 'pve'             // Player vs Computer
  | 'pvp-local'       // Local 2-Player pass & play
  | 'pvp-online'      // Online Multiplayer
  | 'puzzle'          // Tactical puzzles
  | 'openings'        // Interactive opening trainer
  | 'practice';       // Free sandbox analysis

export type AIDifficulty = 
  | 'beginner'        // 600 ELO (fast, occasional mistakes)
  | 'easy'            // 1100 ELO
  | 'intermediate'    // 1600 ELO
  | 'advanced'        // 2000 ELO
  | 'expert'          // 2400 ELO
  | 'master';         // 2800 ELO (full depth search)

export type GameStatus = 
  | 'idle'
  | 'in_progress'
  | 'check'
  | 'checkmate'
  | 'stalemate'
  | 'draw_repetition'
  | 'draw_fifty_moves'
  | 'draw_insufficient_material'
  | 'resigned'
  | 'timeout';

export interface MoveRecord {
  from: Square;
  to: Square;
  san: string;
  fen: string;
  color: Color;
  captured?: PieceType;
  promotion?: PieceType;
  isCheck?: boolean;
  isCheckmate?: boolean;
  timestamp: number;
  timeSpentMs?: number;
}

export interface CombatDuelEvent {
  id: string;
  attackerColor: Color;
  attackerType: PieceType;
  victimColor: Color;
  victimType: PieceType;
  square: Square;
  fromSquare: Square;
  san: string;
  isEnPassant?: boolean;
  timestamp: number;
}

export type BoardThemeId = 
  | 'royal-wood'
  | 'midnight-obsidian'
  | 'emerald-grandmaster'
  | 'royal-gold';

export interface BoardThemeDefinition {
  id: BoardThemeId;
  name: string;
  description: string;
  lightSquare: string;
  darkSquare: string;
  lightSquare3D: string;
  darkSquare3D: string;
  borderColor: string;
  frameTexture: string;
  highlightSelected: string;
  highlightLegal: string;
  highlightLastMove: string;
  highlightCheck: string;
}

export type PieceThemeId = 'staunton' | 'minimalist' | 'luxury-wood';

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  title?: string;
  rating: number;
  country: string;
  isAI?: boolean;
  difficulty?: AIDifficulty;
}

export interface MultiplayerRoom {
  code: string;
  hostName: string;
  opponentName?: string;
  status: 'waiting' | 'ready' | 'playing' | 'ended';
  playerColor: Color;
  timeLimit: number | null;
}

export interface Puzzle {
  id: string;
  title: string;
  rating: number;
  fen: string;
  turn: Color;
  solutionMoves: string[];
  theme: string;
  description: string;
  hint: string;
}

export interface ChessOpening {
  id: string;
  name: string;
  eco: string;
  moves: string[];
  description: string;
  keyIdeas: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface CapturedPiecesState {
  w: PieceType[];
  b: PieceType[];
  scoreDiff: number;
}
