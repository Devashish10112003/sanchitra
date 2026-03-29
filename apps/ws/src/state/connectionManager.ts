import { randomUUID } from "crypto";
import { createClient } from "redis";
import type { RedisClientType } from "redis";
import { WebSocket } from "ws";

type PubSubEnvelope = {
    message: string;
    excludeSocketId?: string;
};

export class PubSubManager {
    private static instance: PubSubManager;
    private readonly redisSubClient: RedisClientType;
    private readonly redisPubClient: RedisClientType;
    private readonly subscriptions: Map<string, Set<WebSocket>>;
    private readonly channelHandlers: Map<string, (message: string) => void>;
    private readonly connectPromise: Promise<void>;

    private constructor() {
        const redisUrl = process.env.REDIS_URL;
        this.redisSubClient = redisUrl ? createClient({ url: redisUrl }) : createClient();
        this.redisPubClient = redisUrl ? createClient({ url: redisUrl }) : createClient();
        this.subscriptions = new Map();
        this.channelHandlers = new Map();
        this.connectPromise = this.connect();
    }

    private async connect() {
        await Promise.all([
            this.redisSubClient.connect(),
            this.redisPubClient.connect(),
        ]);
    }

    public static getInstance(): PubSubManager {
        if (!PubSubManager.instance) {
            PubSubManager.instance = new PubSubManager();
        }
        return PubSubManager.instance;
    }

    public async subscribeWs(roomId: string, socket: WebSocket) {
        await this.connectPromise;

        if (!this.subscriptions.has(roomId)) {
            this.subscriptions.set(roomId, new Set<WebSocket>());
        }
        this.subscriptions.get(roomId)?.add(socket);

        if (this.subscriptions.get(roomId)?.size === 1) {
            const handler = (message: string) => {
                this.handleMessage(roomId, message);
            };
            this.channelHandlers.set(roomId, handler);
            await this.redisSubClient.subscribe(roomId, handler);
        }
    }

    public async unsubscribeWs(roomId: string, socket: WebSocket) {
        const sockets = this.subscriptions.get(roomId);
        sockets?.delete(socket);

        if (sockets && sockets.size === 0) {
            const handler = this.channelHandlers.get(roomId);
            if (handler) {
                await this.redisSubClient.unsubscribe(roomId, handler);
                this.channelHandlers.delete(roomId);
            }
            this.subscriptions.delete(roomId);
        }
    }

    public async publishToRoom(roomId: string, message: string, excludeSocketId?: string) {
        await this.connectPromise;
        const envelope: PubSubEnvelope = { message, excludeSocketId };
        await this.redisPubClient.publish(roomId, JSON.stringify(envelope));
    }

    public handleMessage(roomId: string, rawMessage: string) {
        let payload = rawMessage;
        let excludeSocketId: string | undefined;

        try {
            const parsed = JSON.parse(rawMessage) as Partial<PubSubEnvelope>;
            if (typeof parsed?.message === "string") {
                payload = parsed.message;
                excludeSocketId = parsed.excludeSocketId;
            }
        } catch {
            // Backward compatibility for plain string payloads
        }

        this.subscriptions.get(roomId)?.forEach((socket) => {
            if (socket.readyState !== WebSocket.OPEN) return;

            if (excludeSocketId) {
                const currentSocketId = socketToId.get(socket);
                if (currentSocketId === excludeSocketId) {
                    return;
                }
            }

            socket.send(payload);
        });
    }

    public async disconnect() {
        await Promise.all([
            this.redisSubClient.quit(),
            this.redisPubClient.quit(),
        ]);
    }
}

const socketToId = new Map<WebSocket, string>();
const socketToUser = new Map<WebSocket, string>();
const socketToRooms = new Map<WebSocket, Set<string>>();

export function registerConnection(socket: WebSocket) {
    socketToId.set(socket, randomUUID());
    socketToRooms.set(socket, new Set<string>());
}

export function getSocketId(socket: WebSocket): string | undefined {
    return socketToId.get(socket);
}

export function attachUser(socket: WebSocket, userId: string) {
    socketToUser.set(socket, userId);
}

export function trackRoom(socket: WebSocket, roomId: string) {
    const rooms = socketToRooms.get(socket) ?? new Set<string>();
    rooms.add(roomId);
    socketToRooms.set(socket, rooms);
}

export function untrackRoom(socket: WebSocket, roomId: string) {
    const rooms = socketToRooms.get(socket);
    if (!rooms) return;
    rooms.delete(roomId);
}

export function getRoomsForSocket(socket: WebSocket): string[] {
    return [...(socketToRooms.get(socket) ?? new Set<string>())];
}

export function isSocketInRoom(socket: WebSocket, roomId: string): boolean {
    return socketToRooms.get(socket)?.has(roomId) ?? false;
}

export async function subscribeSocketToRoom(roomId: string, socket: WebSocket) {
    await PubSubManager.getInstance().subscribeWs(roomId, socket);
}

export async function unsubscribeSocketFromRoom(roomId: string, socket: WebSocket) {
    await PubSubManager.getInstance().unsubscribeWs(roomId, socket);
}

export async function publishToRoom(roomId: string, message: string, excludeSocketId?: string) {
    await PubSubManager.getInstance().publishToRoom(roomId, message, excludeSocketId);
}

export async function disconnectPubSub() {
    await PubSubManager.getInstance().disconnect();
}

export function cleanupConnection(socket: WebSocket): { userId?: string; roomIds: string[] } {
    const userId = socketToUser.get(socket);
    const roomIds = getRoomsForSocket(socket);

    socketToId.delete(socket);
    socketToUser.delete(socket);
    socketToRooms.delete(socket);

    return { userId, roomIds };
}
