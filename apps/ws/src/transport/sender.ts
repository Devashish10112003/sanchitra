import type { ServerWSMessage } from "@repo/schemas/types";
import { WebSocket } from "ws";
import { getSocketId, publishToRoom } from "../state/connectionManager";

function isSocketOpen(socket: WebSocket): boolean {
    return socket.readyState === WebSocket.OPEN;
}

export function sendToSocket(socket: WebSocket, message: ServerWSMessage) {
    if (!isSocketOpen(socket)) return;
    socket.send(JSON.stringify(message));
}

export async function broadcastToRoom(
    roomId: string,
    message: ServerWSMessage,
    options?: { excludeSocket?: WebSocket }
) {
    const serialized = JSON.stringify(message);
    const excludeSocketId = options?.excludeSocket ? getSocketId(options.excludeSocket) : undefined;
    await publishToRoom(roomId, serialized, excludeSocketId);
}
