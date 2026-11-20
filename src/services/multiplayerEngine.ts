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
  | { type: 'PING' }
  | { type: 'PONG' };

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

const GOOGLE_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },
];

class MultiplayerEngine {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private localChannel: BroadcastChannel | null = null;
  private callbacks: MultiplayerCallbacks = {};
  private roomCode: string | null = null;
  private isHost: boolean = false;
  private isConnecting: boolean = false;
  private activeTransport: 'local' | 'webrtc' | null = null;
  private pingInterval: any = null;

  private formatPeerId(code: string): string {
    const clean = code.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    return `ownone-chess-v2-${clean}`;
  }

  public setCallbacks(callbacks: MultiplayerCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Host creates a room code and listens for incoming connections
   * Supports both native Local BroadcastChannel (instant multi-tab) and WebRTC (cross-device)
   */
  public async createRoom(
    code: string,
    playerName: string = 'Grandmaster (Host)',
    timeLimit: number = 600,
    callbacks?: MultiplayerCallbacks
  ): Promise<string> {
    this.leaveRoom();
    if (callbacks) this.callbacks = { ...this.callbacks, ...callbacks };

    this.roomCode = code.trim().toUpperCase();
    this.isHost = true;
    this.isConnecting = true;
    const clean = this.roomCode.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Initialize Local High-Speed BroadcastChannel
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.localChannel = new BroadcastChannel(`ownone_room_${clean}`);
        this.localChannel.onmessage = (event) => {
          this.handleLocalMessage(event.data, playerName);
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not available:', e);
    }

    // 2. Initialize WebRTC P2P Peer
    return new Promise((resolve) => {
      try {
        const peerId = this.formatPeerId(this.roomCode!);
        this.peer = new Peer(peerId, {
          debug: 1,
          config: {
            iceServers: GOOGLE_ICE_SERVERS,
          },
        });

        this.peer.on('open', () => {
          this.isConnecting = false;
          resolve(this.roomCode!);
        });

        this.peer.on('connection', (connection) => {
          this.conn = connection;
          this.activeTransport = 'webrtc';
          this.setupWebRTCConnection(playerName, timeLimit);
        });

        this.peer.on('error', (err) => {
          console.warn('PeerJS host notice:', err.type, err.message);
          // If PeerJS server is blocked/offline, local channel still works
          this.isConnecting = false;
          resolve(this.roomCode!);
        });
      } catch (err: any) {
        console.warn('Peer init error:', err);
        this.isConnecting = false;
        resolve(this.roomCode!);
      }

      // Safety timeout: resolve within 2.5s regardless so UI is never blocked
      setTimeout(() => {
        this.isConnecting = false;
        resolve(this.roomCode!);
      }, 2500);
    });
  }

  /**
   * Guest joins an existing room
   * Attempts connection over both Local BroadcastChannel and WebRTC with strict timeout
   */
  public async joinRoom(
    code: string,
    playerName: string = 'Challenger (Guest)',
    callbacks?: MultiplayerCallbacks
  ): Promise<boolean> {
    this.leaveRoom();
    if (callbacks) this.callbacks = { ...this.callbacks, ...callbacks };

    this.roomCode = code.trim().toUpperCase();
    this.isHost = false;
    this.isConnecting = true;
    const clean = this.roomCode.toLowerCase().replace(/[^a-z0-9]/g, '');

    return new Promise((resolve, reject) => {
      let resolved = false;

      const finishSuccess = (transport: 'local' | 'webrtc', hostName: string) => {
        if (resolved) return;
        resolved = true;
        this.isConnecting = false;
        this.activeTransport = transport;
        this.callbacks.onConnected?.(this.roomCode!, hostName || 'Host Grandmaster', 'guest');
        resolve(true);
      };

      const finishError = (message: string) => {
        if (resolved) return;
        resolved = true;
        this.isConnecting = false;
        this.callbacks.onError?.(message);
        reject(new Error(message));
      };

      // 1. Local BroadcastChannel Handshake
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          this.localChannel = new BroadcastChannel(`ownone_room_${clean}`);
          this.localChannel.onmessage = (event) => {
            const data = event.data as MultiplayerPayload;
            if (data?.type === 'HANDSHAKE_ACK') {
              finishSuccess('local', data.name);
            } else {
              this.dispatchPayload(data);
            }
          };

          // Send handshake ping immediately and retry every 400ms for 3 attempts
          const sendLocalPing = () => {
            if (resolved) return;
            try {
              this.localChannel?.postMessage({
                type: 'HANDSHAKE',
                name: playerName,
                color: 'b',
                timeLimit: 600,
              } as MultiplayerPayload);
            } catch {}
          };

          sendLocalPing();
          setTimeout(sendLocalPing, 400);
          setTimeout(sendLocalPing, 800);
        }
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }

      // 2. WebRTC P2P Connection
      try {
        this.peer = new Peer({
          debug: 1,
          config: {
            iceServers: GOOGLE_ICE_SERVERS,
          },
        });

        this.peer.on('open', () => {
          if (resolved) return;
          const targetPeerId = this.formatPeerId(this.roomCode!);
          const connection = this.peer!.connect(targetPeerId, {
            reliable: true,
          });

          this.conn = connection;

          connection.on('open', () => {
            this.setupWebRTCConnection(playerName, 600);
            // Send Handshake
            connection.send({
              type: 'HANDSHAKE',
              name: playerName,
              color: 'b',
              timeLimit: 600,
            } as MultiplayerPayload);
            finishSuccess('webrtc', 'Host Grandmaster');
          });

          connection.on('error', (err) => {
            console.warn('WebRTC conn error:', err);
          });
        });

        this.peer.on('error', (err) => {
          console.warn('PeerJS guest error:', err.type, err.message);
          if (err.type === 'peer-unavailable') {
            // Target host peer not found on WebRTC broker
            if (!resolved && this.activeTransport !== 'local') {
              finishError(`Room "${code}" was not found. Verify the code and ensure host is waiting.`);
            }
          }
        });
      } catch (err: any) {
        console.warn('Guest peer init error:', err);
      }

      // 3. Strict 6-second timeout watchdog (prevents infinite loading spinner)
      setTimeout(() => {
        if (!resolved) {
          if (this.activeTransport === 'local') {
            finishSuccess('local', 'Host Grandmaster');
          } else {
            finishError(`Connection timed out for room "${code}". Ensure the host has created the room.`);
          }
        }
      }, 6000);
    });
  }

  private handleLocalMessage(msg: MultiplayerPayload, myName: string) {
    if (!msg || !msg.type) return;

    if (msg.type === 'HANDSHAKE') {
      if (this.isHost) {
        this.activeTransport = 'local';
        this.localChannel?.postMessage({
          type: 'HANDSHAKE_ACK',
          name: myName,
          color: 'w',
        } as MultiplayerPayload);
        this.callbacks.onConnected?.(this.roomCode!, msg.name, 'host');
      }
    } else if (msg.type === 'HANDSHAKE_ACK') {
      this.activeTransport = 'local';
      this.callbacks.onConnected?.(this.roomCode!, msg.name, 'guest');
    } else {
      this.dispatchPayload(msg);
    }
  }

  private setupWebRTCConnection(playerName: string, timeLimit: number) {
    if (!this.conn) return;

    this.conn.on('data', (data: any) => {
      const msg = data as MultiplayerPayload;
      if (!msg || !msg.type) return;

      if (msg.type === 'HANDSHAKE') {
        if (this.isHost && this.conn && this.conn.open) {
          this.conn.send({
            type: 'HANDSHAKE_ACK',
            name: playerName,
            color: 'w',
          } as MultiplayerPayload);
          this.callbacks.onConnected?.(this.conn.peer, msg.name, 'host');
        }
      } else if (msg.type === 'HANDSHAKE_ACK') {
        if (this.conn) {
          this.callbacks.onConnected?.(this.conn.peer, msg.name, 'guest');
        }
      } else {
        this.dispatchPayload(msg);
      }
    });

    this.conn.on('close', () => {
      if (this.activeTransport === 'webrtc') {
        this.callbacks.onDisconnected?.('Opponent disconnected from the match.');
        this.conn = null;
        this.activeTransport = null;
      }
    });

    this.conn.on('error', (err) => {
      console.warn('WebRTC data channel notice:', err?.message);
    });
  }

  private dispatchPayload(msg: MultiplayerPayload) {
    switch (msg.type) {
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
  }

  /**
   * Broadcast payload over active transport (Local or WebRTC)
   */
  private sendPayload(payload: MultiplayerPayload) {
    // 1. Send via Local BroadcastChannel
    try {
      this.localChannel?.postMessage(payload);
    } catch {}

    // 2. Send via WebRTC DataConnection
    try {
      if (this.conn && this.conn.open) {
        this.conn.send(payload);
      }
    } catch {}
  }

  public sendMove(
    from: Square,
    to: Square,
    promotion: PieceType = 'q',
    whiteTime?: number,
    blackTime?: number
  ) {
    this.sendPayload({
      type: 'MOVE',
      from,
      to,
      promotion,
      whiteTime,
      blackTime,
    });
  }

  public sendClockSync(whiteTime: number, blackTime: number) {
    this.sendPayload({
      type: 'SYNC_CLOCK',
      whiteTime,
      blackTime,
    });
  }

  public sendResign(color: Color) {
    this.sendPayload({
      type: 'RESIGN',
      color,
    });
  }

  public sendRestart() {
    this.sendPayload({
      type: 'RESTART',
    });
  }

  public leaveRoom() {
    if (this.localChannel) {
      try {
        this.localChannel.close();
      } catch {}
      this.localChannel = null;
    }
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
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.roomCode = null;
    this.isHost = false;
    this.isConnecting = false;
    this.activeTransport = null;
  }

  public isConnected(): boolean {
    return Boolean(
      (this.localChannel && this.activeTransport === 'local') ||
      (this.conn && this.conn.open)
    );
  }

  public getRoomCode(): string | null {
    return this.roomCode;
  }

  public getIsHost(): boolean {
    return this.isHost;
  }

  public getTransportType(): 'local' | 'webrtc' | null {
    return this.activeTransport;
  }
}

export const multiplayer = new MultiplayerEngine();
