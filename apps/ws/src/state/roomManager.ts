import type { DrawingElementSchema } from "@repo/schemas/types";
import type { WebSocket } from "ws";

type RoomState = {
    sockets: Set<WebSocket>;
    elements: DrawingElementSchema[];
    past: DrawingElementSchema[][];
    future: DrawingElementSchema[][];
    isLoaded: boolean;
};

const roomStates = new Map<string, RoomState>();

function cloneElements(elements: DrawingElementSchema[]): DrawingElementSchema[] {
    return structuredClone(elements);
}

function getOrCreateRoomState(roomId: string): RoomState {
    const existing = roomStates.get(roomId);
    if (existing) {
        return existing;
    }

    const created: RoomState = {
        sockets: new Set<WebSocket>(),
        elements: [],
        past: [],
        future: [],
        isLoaded: false,
    };

    roomStates.set(roomId, created);
    return created;
}

export function addSocketToRoom(roomId: string, socket: WebSocket) {
    const roomState = getOrCreateRoomState(roomId);
    roomState.sockets.add(socket);
}

export function removeSocketFromRoom(roomId: string, socket: WebSocket) {
    const roomState = roomStates.get(roomId);
    if (!roomState) return;

    roomState.sockets.delete(socket);
    if (roomState.sockets.size === 0) {
        roomStates.delete(roomId);
    }
}

export function getSocketsInRoom(roomId: string): WebSocket[] {
    return [...(roomStates.get(roomId)?.sockets ?? new Set<WebSocket>())];
}

export function markRoomLoaded(roomId: string) {
    const roomState = getOrCreateRoomState(roomId);
    roomState.isLoaded = true;
}

export function isRoomLoaded(roomId: string): boolean {
    return roomStates.get(roomId)?.isLoaded ?? false;
}

export function setRoomElements(roomId: string, elements: DrawingElementSchema[]) {
    const roomState = getOrCreateRoomState(roomId);
    roomState.elements = cloneElements(elements);
    roomState.past = [];
    roomState.future = [];
}

export function getRoomElements(roomId: string): DrawingElementSchema[] {
    return cloneElements(getOrCreateRoomState(roomId).elements);
}

export function snapshotRoom(roomId: string) {
    const roomState = getOrCreateRoomState(roomId);
    roomState.past.push(cloneElements(roomState.elements));
    roomState.future = [];
}

export function createElement(roomId: string, element: DrawingElementSchema): DrawingElementSchema[] {
    const roomState = getOrCreateRoomState(roomId);
    roomState.elements.push(structuredClone(element));
    return getRoomElements(roomId);
}

export function updateElement(roomId: string, element: DrawingElementSchema): DrawingElementSchema[] {
    const roomState = getOrCreateRoomState(roomId);
    const index = roomState.elements.findIndex((current) => current.id === element.id);

    if (index === -1) {
        roomState.elements.push(structuredClone(element));
    } else {
        roomState.elements[index] = structuredClone(element);
    }

    return getRoomElements(roomId);
}

export function deleteElement(roomId: string, elementId: string): DrawingElementSchema[] {
    const roomState = getOrCreateRoomState(roomId);
    roomState.elements = roomState.elements.filter((element) => element.id !== elementId);
    return getRoomElements(roomId);
}

export function undoRoom(roomId: string): DrawingElementSchema[] | null {
    const roomState = getOrCreateRoomState(roomId);
    if (roomState.past.length === 0) return null;

    roomState.future.push(cloneElements(roomState.elements));
    roomState.elements = roomState.past.pop() ?? [];
    return getRoomElements(roomId);
}

export function redoRoom(roomId: string): DrawingElementSchema[] | null {
    const roomState = getOrCreateRoomState(roomId);
    if (roomState.future.length === 0) return null;

    roomState.past.push(cloneElements(roomState.elements));
    roomState.elements = roomState.future.pop() ?? [];
    return getRoomElements(roomId);
}

export function parseCanvasState(canvasState: unknown): DrawingElementSchema[] {
    if (Array.isArray(canvasState)) {
        return canvasState as DrawingElementSchema[];
    }

    if (typeof canvasState === "object" && canvasState !== null && "elements" in canvasState) {
        const value = (canvasState as { elements?: unknown }).elements;
        if (Array.isArray(value)) {
            return value as DrawingElementSchema[];
        }
    }

    return [];
}
