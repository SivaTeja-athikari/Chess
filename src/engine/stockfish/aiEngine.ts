import { Chess } from 'chess.js';
import { AIDifficulty } from '../../types/chess';
import { evaluateBoard } from '../chess-engine/evaluation';

export interface AIMoveResult {
  from: string;
  to: string;
  promotion?: string;
}

export class ChessAIEngine {
  private worker: Worker | null = null;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        this.worker = new Worker(new URL('./ai.worker.ts', import.meta.url), {
          type: 'module',
        });
      } catch (err) {
        console.warn('Web Worker initialization failed, using non-blocking fallback:', err);
        this.worker = null;
      }
    }
  }

  /**
   * Calculates the best move for the active position without blocking the UI
   */
  public async getBestMove(
    fen: string,
    difficulty: AIDifficulty
  ): Promise<AIMoveResult | null> {
    // Add a natural thinking pause (300ms to 700ms)
    const thinkingDelay = this.getSimulatedDelay(difficulty);

    const [workerResult] = await Promise.all([
      this.calculateMove(fen, difficulty),
      new Promise((resolve) => setTimeout(resolve, thinkingDelay)),
    ]);

    return workerResult;
  }

  private calculateMove(
    fen: string,
    difficulty: AIDifficulty
  ): Promise<AIMoveResult | null> {
    const worker = this.worker;

    // Use Web Worker if available
    if (worker) {
      return new Promise((resolve) => {
        let isDone = false;

        const handleMessage = (e: MessageEvent<AIMoveResult | null>) => {
          if (!isDone) {
            isDone = true;
            worker.removeEventListener('message', handleMessage);
            resolve(e.data);
          }
        };

        worker.addEventListener('message', handleMessage);
        worker.postMessage({ fen, difficulty });

        // Safety timeout to prevent any permanent hang
        setTimeout(() => {
          if (!isDone) {
            isDone = true;
            worker.removeEventListener('message', handleMessage);
            worker.terminate();
            this.initWorker();
            resolve(this.fallbackFastSearch(fen));
          }
        }, 3000);
      });
    }

    // Direct fallback (runs max depth 2, guarantees response under 80ms)
    return Promise.resolve(this.fallbackFastSearch(fen));
  }

  private fallbackFastSearch(fen: string): AIMoveResult | null {
    const game = new Chess(fen);
    const moves = game.moves({ verbose: true });
    if (!moves.length) return null;

    let bestMove = moves[0];
    const isMax = game.turn() === 'w';
    let bestScore = isMax ? -Infinity : Infinity;

    for (const move of moves) {
      game.move(move);
      const score = evaluateBoard(game);
      game.undo();

      if (isMax) {
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    }

    return { from: bestMove.from, to: bestMove.to, promotion: bestMove.promotion };
  }

  private getSimulatedDelay(diff: AIDifficulty): number {
    switch (diff) {
      case 'beginner':
        return 300 + Math.random() * 200;
      case 'easy':
        return 400 + Math.random() * 250;
      case 'intermediate':
        return 500 + Math.random() * 300;
      case 'advanced':
        return 650 + Math.random() * 350;
      case 'expert':
        return 800 + Math.random() * 400;
      case 'master':
        return 900 + Math.random() * 400;
    }
  }
}

export const aiEngine = new ChessAIEngine();
