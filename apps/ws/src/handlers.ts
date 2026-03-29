import prisma from "@repo/db/client";
import { ClientWSMessage, drawingElementSchema } from "@repo/schemas/types";
import type { WebSocket } from "ws";
import {
    attachUser,
    cleanupConnection,
    isSocketInRoom,
    subscribeSocketToRoom,
    trackRoom,
    untrackRoom,
    unsubscribeSocketFromRoom,
} from "./state/connectionManager";
import {
    addSocketToRoom,
    createElement,
    deleteElement,
    getRoomElements,
    isRoomLoaded,
    markRoomLoaded,
    parseCanvasState,
    redoRoom,
    removeSocketFromRoom,
    setRoomElements,
    snapshotRoom,
    undoRoom,
    updateElement,
} from "./state/roomManager";
import { createServerMessage } from "./transport/MessaageFactory";
import { broadcastToRoom, sendToSocket } from "./transport/sender";

async function persistRoomElements(roomId: string, elements: ReturnType<typeof getRoomElements>) {
    await prisma.room.update({
        where: { id: roomId },
        data: {
            canvasState: {
                elements,
            },
        },
    });
}

async function ensureRoomAccess(roomId: string, userId: string): Promise<boolean> {
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            members: {
                where: { userId },
            },
        },
    });

    if (!room) {
        return false;
    }

    const isOwner = room.ownerId === userId;
    const isMember = room.members.length > 0;

    if (!isOwner && !isMember) {
        await prisma.roomMember.create({
            data: {
                userId,
                roomId,
                role: "EDITOR",
            },
        });
    }

    return true;
}

async function ensureRoomLoaded(roomId: string) {
    if (isRoomLoaded(roomId)) return;

    const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: { canvasState: true },
    });

    const elements = parseCanvasState(room?.canvasState);
    setRoomElements(roomId, elements);
    markRoomLoaded(roomId);
}

async function onRoomJoin(socket: WebSocket, message: ClientWSMessage) {
    const roomId = message.roomId;
    const userId = message.userId;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    });

    if (!user) return;

    const hasAccess = await ensureRoomAccess(roomId, userId);
    if (!hasAccess) return;

    attachUser(socket, userId);
    trackRoom(socket, roomId);
    await subscribeSocketToRoom(roomId, socket);
    addSocketToRoom(roomId, socket);
    await ensureRoomLoaded(roomId);

    const roomState = createServerMessage(
        "ROOM_STATE",
        { elements: getRoomElements(roomId) },
        { roomId, userId }
    );
    sendToSocket(socket, roomState);

    const userJoined = createServerMessage(
        "USER_JOINED",
        { userId },
        { roomId, userId }
    );
    await broadcastToRoom(roomId, userJoined, { excludeSocket: socket });
}

async function onElementCreate(socket: WebSocket, message: ClientWSMessage) {
    const roomId = message.roomId;
    if (!isSocketInRoom(socket, roomId) || message.data.type !== "ELEMENT_CREATE") return;

    const parsedElement = drawingElementSchema.safeParse(message.data.payload);
    if (!parsedElement.success) return;

    snapshotRoom(roomId);
    const elements = createElement(roomId, parsedElement.data);
    await persistRoomElements(roomId, elements);

    const outgoing = createServerMessage(
        "ELEMENT_CREATED",
        parsedElement.data,
        { roomId, userId: message.userId }
    );
    await broadcastToRoom(roomId, outgoing, { excludeSocket: socket });
}

async function onElementUpdate(socket: WebSocket, message: ClientWSMessage) {
    const roomId = message.roomId;
    if (!isSocketInRoom(socket, roomId) || message.data.type !== "ELEMENT_UPDATE") return;

    const parsedElement = drawingElementSchema.safeParse(message.data.payload);
    if (!parsedElement.success) return;

    snapshotRoom(roomId);
    const elements = updateElement(roomId, parsedElement.data);
    await persistRoomElements(roomId, elements);

    const outgoing = createServerMessage(
        "ELEMENT_UPDATED",
        parsedElement.data,
        { roomId, userId: message.userId }
    );
    await broadcastToRoom(roomId, outgoing, { excludeSocket: socket });
}

async function onElementDelete(socket: WebSocket, message: ClientWSMessage) {
    const roomId = message.roomId;
    if (!isSocketInRoom(socket, roomId) || message.data.type !== "ELEMENT_DELETE") return;

    snapshotRoom(roomId);
    const elements = deleteElement(roomId, message.data.payload.elementId);
    await persistRoomElements(roomId, elements);

    const outgoing = createServerMessage(
        "ELEMENT_DELETED",
        { elementId: message.data.payload.elementId },
        { roomId, userId: message.userId }
    );
    await broadcastToRoom(roomId, outgoing, { excludeSocket: socket });
}

async function onUndo(socket: WebSocket, message: ClientWSMessage) {
    const roomId = message.roomId;
    if (!isSocketInRoom(socket, roomId) || message.data.type !== "UNDO") return;

    const elements = undoRoom(roomId);
    if (!elements) return;

    await persistRoomElements(roomId, elements);

    const outgoing = createServerMessage(
        "ROOM_STATE",
        { elements },
        { roomId, userId: message.userId }
    );
    await broadcastToRoom(roomId, outgoing);
}

async function onRedo(socket: WebSocket, message: ClientWSMessage) {
    const roomId = message.roomId;
    if (!isSocketInRoom(socket, roomId) || message.data.type !== "REDO") return;

    const elements = redoRoom(roomId);
    if (!elements) return;

    await persistRoomElements(roomId, elements);

    const outgoing = createServerMessage(
        "ROOM_STATE",
        { elements },
        { roomId, userId: message.userId }
    );
    await broadcastToRoom(roomId, outgoing);
}

async function onCursorMove(socket: WebSocket, message: ClientWSMessage) {
    const roomId = message.roomId;
    if (!isSocketInRoom(socket, roomId) || message.data.type !== "CURSOR_MOVE") return;

    const outgoing = createServerMessage(
        "CURSOR_UPDATE",
        { userId: message.userId, x: message.data.payload.x, y: message.data.payload.y },
        { roomId, userId: message.userId }
    );
    await broadcastToRoom(roomId, outgoing, { excludeSocket: socket });
}

export async function routeMessage(socket: WebSocket, message: ClientWSMessage) {
    switch (message.data.type) {
        case "ROOM_JOIN":
            await onRoomJoin(socket, message);
            break;

        case "ELEMENT_CREATE":
            await onElementCreate(socket, message);
            break;

        case "ELEMENT_UPDATE":
            await onElementUpdate(socket, message);
            break;

        case "ELEMENT_DELETE":
            await onElementDelete(socket, message);
            break;

        case "CURSOR_MOVE":
            await onCursorMove(socket, message);
            break;

        case "UNDO":
            await onUndo(socket, message);
            break;

        case "REDO":
            await onRedo(socket, message);
            break;

        default:
            break;
    }
}

export async function handleSocketDisconnect(socket: WebSocket) {
    const { userId, roomIds } = cleanupConnection(socket);

    for (const roomId of roomIds) {
        await unsubscribeSocketFromRoom(roomId, socket);
        removeSocketFromRoom(roomId, socket);
        untrackRoom(socket, roomId);

        if (!userId) continue;
        const outgoing = createServerMessage(
            "USER_LEFT",
            { userId },
            { roomId, userId }
        );
        await broadcastToRoom(roomId, outgoing, { excludeSocket: socket });
    }
}
