import { Square, PieceType, Color, MoveRecord, GameStatus } from '../types/chess';
import { MqttRelay, MqttMessage } from './mqttRelay';

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
      moveNumber: number;
      fen?: string;
    }
  | { type: 'SYNC_REQUEST'; fromRole: 'host' | 'guest' }
  | {
      type: 'SYNC_STATE';
      fen: string;
      history: MoveRecord[];
      whiteTime: number;
      blackTime: number;
      status: GameStatus;
      winner: Color | 'draw' | null;
      moveNumber: number;
    }
  | { type: 'SYNC_CLOCK'; whiteTime: number; blackTime: number }
  | { type: 'RESIGN'; color: Color }
  | { type: 'RESTART' }
  | { type: 'LEAVE' }
  | { type: 'PING' };

interface MultiplayerCallbacks {
  onConnected?: (peerId: string, opponentName: string, role: 'host' | 'guest') => void;
  onMoveReceived?: (
    from: Square,
    to: Square,
    promotion?: PieceType,
    whiteTime?: number,
    blackTime?: number,
    moveNumber?: number,
    fen?: string
  ) => void;
  onSyncRequested?: (fromRole: 'host' | 'guest') => void;
  onSyncStateReceived?: (
    fen: string,
    history: MoveRecord[],
    whiteTime: number,
    blackTime: number,
    status: GameStatus,
    winner: Color | 'draw' | null
  ) => void;
  onClockSync?: (whiteTime: number, blackTime: number) => void;
  onOpponentResigned?: (color: Color) => void;
  onRestartRequested?: () => void;
  onOpponentLeft?: () => void;
  onDisconnected?: (reason?: string) => void;
  onError?: (error: string) => void;
}

class MultiplayerEngine {
  private mqtt: MqttRelay = new MqttRelay();
  private localChannel: BroadcastChannel | null = null;
  private callbacks: MultiplayerCallbacks = {};
  private roomCode: string | null = null;
  private isHost: boolean = false;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private handshakeTimer: any = null;
  private lastProcessedMoveNumber: number = -1;

  public setCallbacks(callbacks: MultiplayerCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  private cleanRoomCode(code: string): string {
    return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

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
    this.lastProcessedMoveNumber = -1;
    const clean = this.cleanRoomCode(this.roomCode);
    const topic = `ownone/chess/v4/${clean}`;

    // 1. Local BroadcastChannel
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.localChannel = new BroadcastChannel(`ownone_room_${clean}`);
        this.localChannel.onmessage = (event) => {
          this.handleIncomingPayload(event.data, playerName, 'local');
        };
      }
    } catch {}

    // 2. Cloud WebSocket Relay
    try {
      await this.mqtt.connect(topic, (msg: MqttMessage) => {
        this.handleIncomingPayload(msg as any, playerName, 'cloud');
      });
      this.isConnecting = false;
    } catch (err) {
      console.warn('Cloud relay warning:', err);
      this.isConnecting = false;
    }

    return this.roomCode;
  }

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
    this.lastProcessedMoveNumber = -1;
    const clean = this.cleanRoomCode(this.roomCode);
    const topic = `ownone/chess/v4/${clean}`;

    return new Promise(async (resolve, reject) => {
      let connected = false;

      const finishSuccess = (hostName: string) => {
        if (connected) return;
        connected = true;
        this.isConnected = true;
        this.isConnecting = false;
        if (this.handshakeTimer) clearInterval(this.handshakeTimer);
        this.callbacks.onConnected?.(this.roomCode!, hostName || 'Host Grandmaster', 'guest');
        resolve(true);
      };

      const finishError = (message: string) => {
        if (connected) return;
        connected = true;
        this.isConnecting = false;
        if (this.handshakeTimer) clearInterval(this.handshakeTimer);
        this.callbacks.onError?.(message);
        reject(new Error(message));
      };

      // 1. Local BroadcastChannel
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          this.localChannel = new BroadcastChannel(`ownone_room_${clean}`);
          this.localChannel.onmessage = (event) => {
            const data = event.data as MultiplayerPayload;
            if (data?.type === 'HANDSHAKE_ACK') {
              finishSuccess(data.name);
            } else {
              this.dispatchPayload(data);
            }
          };
        }
      } catch {}

      // 2. Cloud WebSocket Relay
      try {
        await this.mqtt.connect(topic, (msg: MqttMessage) => {
          const payload = msg as any as MultiplayerPayload;
          if (payload?.type === 'HANDSHAKE_ACK') {
            finishSuccess(payload.name);
          } else {
            this.dispatchPayload(payload);
          }
        });
      } catch (err) {
        console.warn('MQTT connect error:', err);
      }

      // 3. Handshake ping retry loop
      const sendHandshake = () => {
        if (connected) return;
        const handshakePayload: MultiplayerPayload = {
          type: 'HANDSHAKE',
          name: playerName,
          color: 'b',
          timeLimit: 600,
        };

        try {
          this.localChannel?.postMessage(handshakePayload);
        } catch {}
        this.mqtt.publish(handshakePayload);
      };

      sendHandshake();
      this.handshakeTimer = setInterval(sendHandshake, 600);

      // 4. Timeout watchdog: 12 seconds
      setTimeout(() => {
        if (!connected) {
          finishError(`Could not find active host in room "${code}". Ensure the host has created the room.`);
        }
      }, 12000);
    });
  }

  public async reconnect(
    code: string,
    playerName: string = 'Player',
    role: 'host' | 'guest' = 'host',
    callbacks?: MultiplayerCallbacks
  ): Promise<boolean> {
    this.leaveRoom();
    if (callbacks) this.callbacks = { ...this.callbacks, ...callbacks };

    this.roomCode = code.trim().toUpperCase();
    this.isHost = role === 'host';
    this.isConnected = true;
    const clean = this.cleanRoomCode(this.roomCode);
    const topic = `ownone/chess/v4/${clean}`;

    // 1. Local BroadcastChannel
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.localChannel = new BroadcastChannel(`ownone_room_${clean}`);
        this.localChannel.onmessage = (event) => {
          this.handleIncomingPayload(event.data, playerName, 'local');
        };
      }
    } catch {}

    // 2. Cloud WebSocket Relay
    try {
      await this.mqtt.connect(topic, (msg: MqttMessage) => {
        this.handleIncomingPayload(msg as any, playerName, 'cloud');
      });
      return true;
    } catch (err) {
      console.warn('Reconnect error:', err);
      return false;
    }
  }

  private handleIncomingPayload(
    msg: MultiplayerPayload,
    myPlayerName: string,
    source: 'local' | 'cloud'
  ) {
    if (!msg || !msg.type) return;

    if (msg.type === 'HANDSHAKE') {
      if (this.isHost) {
        this.isConnected = true;
        const ackPayload: MultiplayerPayload = {
          type: 'HANDSHAKE_ACK',
          name: myPlayerName,
          color: 'w',
        };

        if (source === 'local') {
          try {
            this.localChannel?.postMessage(ackPayload);
          } catch {}
        }
        this.mqtt.publish(ackPayload);

        this.callbacks.onConnected?.(this.roomCode!, msg.name, 'host');
      }
    } else if (msg.type === 'HANDSHAKE_ACK') {
      this.isConnected = true;
      this.callbacks.onConnected?.(this.roomCode!, msg.name, 'guest');
    } else {
      this.dispatchPayload(msg);
    }
  }

  private dispatchPayload(msg: MultiplayerPayload) {
    switch (msg.type) {
      case 'MOVE':
        // Edge Case Prevention: Prevent duplicate moves
        if (msg.moveNumber !== undefined && msg.moveNumber <= this.lastProcessedMoveNumber) {
          return;
        }
        if (msg.moveNumber !== undefined) {
          this.lastProcessedMoveNumber = msg.moveNumber;
        }
        this.callbacks.onMoveReceived?.(
          msg.from,
          msg.to,
          msg.promotion,
          msg.whiteTime,
          msg.blackTime,
          msg.moveNumber,
          msg.fen
        );
        break;

      case 'SYNC_REQUEST':
        this.callbacks.onSyncRequested?.(msg.fromRole);
        break;

      case 'SYNC_STATE':
        if (msg.moveNumber !== undefined) {
          this.lastProcessedMoveNumber = Math.max(this.lastProcessedMoveNumber, msg.moveNumber);
        }
        this.callbacks.onSyncStateReceived?.(
          msg.fen,
          msg.history,
          msg.whiteTime,
          msg.blackTime,
          msg.status,
          msg.winner
        );
        break;

      case 'SYNC_CLOCK':
        this.callbacks.onClockSync?.(msg.whiteTime, msg.blackTime);
        break;

      case 'RESIGN':
        this.callbacks.onOpponentResigned?.(msg.color);
        break;

      case 'RESTART':
        this.lastProcessedMoveNumber = -1;
        this.callbacks.onRestartRequested?.();
        break;

      case 'LEAVE':
        this.callbacks.onOpponentLeft?.();
        break;
    }
  }

  private sendPayload(payload: MultiplayerPayload) {
    try {
      this.localChannel?.postMessage(payload);
    } catch {}
    this.mqtt.publish(payload);
  }

  public sendMove(
    from: Square,
    to: Square,
    promotion: PieceType = 'q',
    whiteTime?: number,
    blackTime?: number,
    moveNumber: number = 0,
    fen?: string
  ) {
    this.lastProcessedMoveNumber = Math.max(this.lastProcessedMoveNumber, moveNumber);
    this.sendPayload({
      type: 'MOVE',
      from,
      to,
      promotion,
      whiteTime,
      blackTime,
      moveNumber,
      fen,
    });
  }

  public sendSyncRequest(fromRole: 'host' | 'guest') {
    this.sendPayload({
      type: 'SYNC_REQUEST',
      fromRole,
    });
  }

  public sendSyncState(
    fen: string,
    history: MoveRecord[],
    whiteTime: number,
    blackTime: number,
    status: GameStatus,
    winner: Color | 'draw' | null
  ) {
    this.sendPayload({
      type: 'SYNC_STATE',
      fen,
      history,
      whiteTime,
      blackTime,
      status,
      winner,
      moveNumber: history.length,
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
    this.lastProcessedMoveNumber = -1;
    this.sendPayload({
      type: 'RESTART',
    });
  }

  public sendLeave() {
    this.sendPayload({
      type: 'LEAVE',
    });
  }

  public leaveRoom() {
    if (this.handshakeTimer) {
      clearInterval(this.handshakeTimer);
      this.handshakeTimer = null;
    }
    if (this.localChannel) {
      try {
        this.localChannel.close();
      } catch {}
      this.localChannel = null;
    }
    this.mqtt.disconnect();
    this.roomCode = null;
    this.isHost = false;
    this.isConnected = false;
    this.isConnecting = false;
    this.lastProcessedMoveNumber = -1;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public getRoomCode(): string | null {
    return this.roomCode;
  }

  public getIsHost(): boolean {
    return this.isHost;
  }
}

export const multiplayer = new MultiplayerEngine();
