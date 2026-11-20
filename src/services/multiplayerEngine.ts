import { Peer, DataConnection } from 'peerjs';
import { Square, PieceType, Color } from '../types/chess';

export type MultiplayerPayload =
  | { type: 'HANDSHAKE'; name: string; color: Color; timeLimit: number }
  | { type: 'HANDSHAKE_ACK'; name: string; color: Color }
  | {
      type: 'MOVE';
      from: Square;
      to: Square;
      promotion?: PieceType;
      whiteTime?: number;
      blackTime?: number;
    }
  | { type: 'SYNC_CLOCK'; whiteTime: number; blackTime: number }
  | { type: 'RESIGN'; color: Color }
  | { type: 'RESTART' }
  | { type: 'PING' };

interface MultiplayerCallbacks {
  onConnected?: (peerId: string, opponentName: string, role: 'host' | 'guest') => void;
  onMoveReceived?: (
    from: Square,
    to: Square,
    promotion?: PieceType,
    whiteTime?: number,
    blackTime?: number
  ) => void;
  onClockSync?: (whiteTime: number, blackTime: number) => void;
  onOpponentResigned?: (color: Color) => void;
  onRestartRequested?: () => void;
  onDisconnected?: (reason?: string) => void;
  onError?: (error: string) => void;
}

class MultiplayerEngine {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private callbacks: MultiplayerCallbacks = {};
  private roomCode: string | null = null;
  private isHost: boolean = false;
  private isConnecting: boolean = false;

  private formatPeerId(code: string): string {
    const clean = code.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    return `ownone-chess-${clean}`;
  }

  public setCallbacks(callbacks: MultiplayerCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Host creates a room code and waits for a guest to connect
   */
  public async createRoom(
    code: string,
    playerName: string = 'Grandmaster (Host)',
    timeLimit: number = 600,
    callbacks?: MultiplayerCallbacks
  ): Promise<string> {
    this.leaveRoom();
    if (callbacks) this.callbacks = { ...this.callbacks, ...callbacks };

    this.roomCode = code;
    this.isHost = true;
    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        const peerId = this.formatPeerId(code);
        this.peer = new Peer(peerId, {
          debug: 1,
        });

        this.peer.on('open', (id) => {
          this.isConnecting = false;
          resolve(code);
        });

        this.peer.on('connection', (connection) => {
          this.conn = connection;
          this.setupConnectionHandlers(playerName, timeLimit);
        });

        this.peer.on('error', (err) => {
          this.isConnecting = false;
          let message = 'Unable to create multiplayer room.';
          if (err.type === 'unavailable-id') {
            message = 'Room code is already active. Please generate a new code.';
          }
          this.callbacks.onError?.(message);
          reject(new Error(message));
        });
      } catch (err: any) {
        this.isConnecting = false;
        const msg = err?.message || 'Failed to initialize peer';
        this.callbacks.onError?.(msg);
        reject(err);
      }
    });
  }

  /**
   * Guest connects to an existing host room code
   */
  public async joinRoom(
    code: string,
    playerName: string = 'Challenger (Guest)',
    callbacks?: MultiplayerCallbacks
  ): Promise<boolean> {
    this.leaveRoom();
    if (callbacks) this.callbacks = { ...this.callbacks, ...callbacks };

    this.roomCode = code;
    this.isHost = false;
    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        // Random guest peer ID
        this.peer = new Peer({ debug: 1 });

        this.peer.on('open', () => {
          const targetPeerId = this.formatPeerId(code);
          const connection = this.peer!.connect(targetPeerId, {
            reliable: true,
          });

          this.conn = connection;

          connection.on('open', () => {
            this.isConnecting = false;
            // Send Handshake to Host
            connection.send({
              type: 'HANDSHAKE',
              name: playerName,
              color: 'b',
              timeLimit: 600,
            } as MultiplayerPayload);

            this.setupConnectionHandlers(playerName, 600);
            this.callbacks.onConnected?.(targetPeerId, 'Host Player', 'guest');
            resolve(true);
          });

          connection.on('error', (err) => {
            this.isConnecting = false;
            const msg = 'Failed to connect to host. Make sure room code is correct.';
            this.callbacks.onError?.(msg);
            reject(new Error(msg));
          });
        });

        this.peer.on('error', (err) => {
          this.isConnecting = false;
          let msg = 'Failed to join multiplayer room.';
          if (err.type === 'peer-unavailable') {
            msg = `Room ${code} was not found or the host has disconnected.`;
          }
          this.callbacks.onError?.(msg);
          reject(new Error(msg));
        });
      } catch (err: any) {
        this.isConnecting = false;
        const msg = err?.message || 'Connection error';
        this.callbacks.onError?.(msg);
        reject(err);
      }
    });
  }

  private setupConnectionHandlers(playerName: string, timeLimit: number) {
    if (!this.conn) return;

    this.conn.on('data', (data: any) => {
      const msg = data as MultiplayerPayload;
      if (!msg || !msg.type) return;

      switch (msg.type) {
        case 'HANDSHAKE':
          // Host receives handshake from guest -> respond with ACK
          if (this.isHost && this.conn) {
            this.conn.send({
              type: 'HANDSHAKE_ACK',
              name: playerName,
              color: 'w',
            } as MultiplayerPayload);
            this.callbacks.onConnected?.(this.conn.peer, msg.name, 'host');
          }
          break;

        case 'HANDSHAKE_ACK':
          // Guest receives handshake acknowledgment from host
          if (this.conn) {
            this.callbacks.onConnected?.(this.conn.peer, msg.name, 'guest');
          }
          break;

        case 'MOVE':
          this.callbacks.onMoveReceived?.(
            msg.from,
            msg.to,
            msg.promotion,
            msg.whiteTime,
            msg.blackTime
          );
          break;

        case 'SYNC_CLOCK':
          this.callbacks.onClockSync?.(msg.whiteTime, msg.blackTime);
          break;

        case 'RESIGN':
          this.callbacks.onOpponentResigned?.(msg.color);
          break;

        case 'RESTART':
          this.callbacks.onRestartRequested?.();
          break;
      }
    });

    this.conn.on('close', () => {
      this.callbacks.onDisconnected?.('Opponent disconnected from the match.');
      this.conn = null;
    });

    this.conn.on('error', (err) => {
      this.callbacks.onError?.(err?.message || 'Data connection error');
    });
  }

  /**
   * Broadcast a move across the WebRTC connection
   */
  public sendMove(
    from: Square,
    to: Square,
    promotion: PieceType = 'q',
    whiteTime?: number,
    blackTime?: number
  ) {
    if (this.conn && this.conn.open) {
      this.conn.send({
        type: 'MOVE',
        from,
        to,
        promotion,
        whiteTime,
        blackTime,
      } as MultiplayerPayload);
    }
  }

  /**
   * Sync clock times
   */
  public sendClockSync(whiteTime: number, blackTime: number) {
    if (this.conn && this.conn.open) {
      this.conn.send({
        type: 'SYNC_CLOCK',
        whiteTime,
        blackTime,
      } as MultiplayerPayload);
    }
  }

  /**
   * Broadcast resignation
   */
  public sendResign(color: Color) {
    if (this.conn && this.conn.open) {
      this.conn.send({
        type: 'RESIGN',
        color,
      } as MultiplayerPayload);
    }
  }

  /**
   * Broadcast restart/rematch request
   */
  public sendRestart() {
    if (this.conn && this.conn.open) {
      this.conn.send({
        type: 'RESTART',
      } as MultiplayerPayload);
    }
  }

  /**
   * Cleanly disconnect and destroy peer
   */
  public leaveRoom() {
    if (this.conn) {
      try {
        this.conn.close();
      } catch {}
      this.conn = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
    }
    this.roomCode = null;
    this.isHost = false;
    this.isConnecting = false;
  }

  public isConnected(): boolean {
    return Boolean(this.conn && this.conn.open);
  }

  public getRoomCode(): string | null {
    return this.roomCode;
  }

  public getIsHost(): boolean {
    return this.isHost;
  }
}

export const multiplayer = new MultiplayerEngine();
