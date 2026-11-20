import { Color, GameStatus, MoveRecord } from '../types/chess';

const SESSION_KEY = 'ownone_active_multiplayer_match';

export interface SavedMultiplayerSession {
  roomCode: string;
  playerColor: Color;
  role: 'host' | 'guest';
  opponentName: string;
  fen: string;
  history: MoveRecord[];
  whiteTime: number;
  blackTime: number;
  timeLimit: number | null;
  status: GameStatus;
  winner: Color | 'draw' | null;
  savedAt: number;
}

export const multiplayerSession = {
  save(session: Omit<SavedMultiplayerSession, 'savedAt'>) {
    try {
      const full: SavedMultiplayerSession = {
        ...session,
        savedAt: Date.now(),
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(full));
      localStorage.setItem(SESSION_KEY, JSON.stringify(full));
    } catch (e) {
      console.warn('Failed to save multiplayer session:', e);
    }
  },

  load(): SavedMultiplayerSession | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      if (!raw) return null;

      const data = JSON.parse(raw) as SavedMultiplayerSession;
      // Expire session after 3 hours
      if (Date.now() - data.savedAt > 3 * 60 * 60 * 1000) {
        multiplayerSession.clear();
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  clear() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {}
  },
};
