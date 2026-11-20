/**
 * Zero-Account, 100% Free Public Real-Time WebSocket Relay
 * Uses standard MQTT 3.1.1 framing over secure WebSockets (WSS).
 * Connects any two devices (phones, laptops, tablets) worldwide with 0 configuration.
 */

export interface MqttMessage {
  type: string;
  senderId: string;
  [key: string]: any;
}

export type MessageCallback = (message: MqttMessage) => void;

function encodeString(str: string): Uint8Array {
  const bytes = new TextEncoder().encode(str);
  const result = new Uint8Array(2 + bytes.length);
  result[0] = (bytes.length >> 8) & 0xff;
  result[1] = bytes.length & 0xff;
  result.set(bytes, 2);
  return result;
}

function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  const totalLen = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function encodeRemainingLength(length: number): Uint8Array {
  const bytes: number[] = [];
  do {
    let digit = length % 128;
    length = Math.floor(length / 128);
    if (length > 0) {
      digit = digit | 0x80;
    }
    bytes.push(digit);
  } while (length > 0);
  return new Uint8Array(bytes);
}

function createConnectPacket(clientId: string): Uint8Array {
  const protoName = encodeString('MQTT');
  const protoLevel = new Uint8Array([0x04]); // MQTT 3.1.1
  const connectFlags = new Uint8Array([0x02]); // Clean session
  const keepAlive = new Uint8Array([0x00, 0x3c]); // 60s
  const payload = encodeString(clientId);

  const body = concatUint8Arrays([protoName, protoLevel, connectFlags, keepAlive, payload]);
  const header = concatUint8Arrays([new Uint8Array([0x10]), encodeRemainingLength(body.length)]);
  return concatUint8Arrays([header, body]);
}

function createSubscribePacket(topic: string, packetId: number = 1): Uint8Array {
  const packetIdBuf = new Uint8Array([(packetId >> 8) & 0xff, packetId & 0xff]);
  const topicBuf = encodeString(topic);
  const qosBuf = new Uint8Array([0x00]); // QoS 0

  const body = concatUint8Arrays([packetIdBuf, topicBuf, qosBuf]);
  const header = concatUint8Arrays([new Uint8Array([0x82]), encodeRemainingLength(body.length)]);
  return concatUint8Arrays([header, body]);
}

function createPublishPacket(topic: string, message: string): Uint8Array {
  const topicBytes = encodeString(topic);
  const messageBytes = new TextEncoder().encode(message);

  const body = concatUint8Arrays([topicBytes, messageBytes]);
  const header = concatUint8Arrays([new Uint8Array([0x30]), encodeRemainingLength(body.length)]);
  return concatUint8Arrays([header, body]);
}

function parsePublishPacket(view: Uint8Array): { topic: string; payload: string } | null {
  try {
    let offset = 0;
    const firstByte = view[offset++];
    const packetType = firstByte >> 4;
    if (packetType !== 3) return null; // Only handle PUBLISH packets

    // Decode variable remaining length
    let multiplier = 1;
    let remainingLength = 0;
    let digit: number;
    do {
      digit = view[offset++];
      remainingLength += (digit & 0x7f) * multiplier;
      multiplier *= 128;
    } while ((digit & 0x80) !== 0 && offset < view.length);

    // Topic string length (16-bit BE)
    const topicLen = (view[offset] << 8) | view[offset + 1];
    offset += 2;
    const topic = new TextDecoder().decode(view.subarray(offset, offset + topicLen));
    offset += topicLen;

    // Payload
    const payload = new TextDecoder().decode(view.subarray(offset));
    return { topic, payload };
  } catch {
    return null;
  }
}

const PUBLIC_BROKERS = [
  'wss://broker.hivemq.com:8884/mqtt',
  'wss://broker.emqx.io:8084/mqtt',
];

export class MqttRelay {
  private ws: WebSocket | null = null;
  private clientId: string;
  private currentTopic: string | null = null;
  private onMessageCallback: MessageCallback | null = null;
  private isConnected: boolean = false;
  private brokerIndex: number = 0;
  private pingTimer: any = null;

  constructor() {
    this.clientId = `chess_${Math.random().toString(36).substring(2, 10)}`;
  }

  public getClientId(): string {
    return this.clientId;
  }

  public connect(topic: string, onMessage: MessageCallback): Promise<boolean> {
    this.disconnect();
    this.currentTopic = topic;
    this.onMessageCallback = onMessage;

    return new Promise((resolve) => {
      let resolved = false;
      const brokerUrl = PUBLIC_BROKERS[this.brokerIndex % PUBLIC_BROKERS.length];

      try {
        this.ws = new WebSocket(brokerUrl, ['mqttv3.1', 'mqtt']);
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          // Send MQTT CONNECT packet
          const connectPacket = createConnectPacket(this.clientId);
          this.ws?.send(connectPacket);
        };

        this.ws.onmessage = (event) => {
          const data = new Uint8Array(event.data as ArrayBuffer);
          if (data.length === 0) return;

          const packetType = data[0] >> 4;

          // CONNACK packet (Type 2)
          if (packetType === 2) {
            this.isConnected = true;
            // Send SUBSCRIBE packet to the room topic
            if (this.currentTopic) {
              const subPacket = createSubscribePacket(this.currentTopic, 1);
              this.ws?.send(subPacket);
            }

            // Start heartbeat ping every 25 seconds
            this.startPing();

            if (!resolved) {
              resolved = true;
              resolve(true);
            }
          }

          // PUBLISH packet (Type 3)
          if (packetType === 3) {
            const parsed = parsePublishPacket(data);
            if (parsed && parsed.payload) {
              try {
                const json = JSON.parse(parsed.payload) as MqttMessage;
                // Ignore messages sent by self
                if (json.senderId !== this.clientId) {
                  this.onMessageCallback?.(json);
                }
              } catch {}
            }
          }
        };

        this.ws.onerror = () => {
          if (!resolved) {
            resolved = true;
            this.brokerIndex++;
            resolve(false);
          }
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.stopPing();
        };

        // 4-second timeout to fall back to secondary broker
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve(this.isConnected);
          }
        }, 4000);
      } catch (err) {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      }
    });
  }

  public publish(message: Record<string, any>) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.currentTopic) return;

    try {
      const fullMessage = {
        ...message,
        senderId: this.clientId,
        timestamp: Date.now(),
      };

      const payload = JSON.stringify(fullMessage);
      const packet = createPublishPacket(this.currentTopic, payload);
      this.ws.send(packet);
    } catch (err) {
      console.warn('Publish error:', err);
    }
  }

  private startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // MQTT PINGREQ packet (0xc0, 0x00)
        this.ws.send(new Uint8Array([0xc0, 0x00]));
      }
    }, 25000);
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  public disconnect() {
    this.stopPing();
    if (this.ws) {
      try {
        // Send DISCONNECT packet (0xe0, 0x00)
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(new Uint8Array([0xe0, 0x00]));
        }
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.isConnected = false;
    this.currentTopic = null;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }
}
