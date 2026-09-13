import { useEffect, useRef, useState } from "react";
import type { ClientWSMessage, DrawingElementSchema, ServerWSMessage } from "@repo/schemas/types";

const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:8080";
const RECONNECT_DELAY_MS = 2000;

type CollabHandlers = {
  onRoomState: (elements: DrawingElementSchema[]) => void;
  onElementCreated: (element: DrawingElementSchema) => void;
  onElementUpdated: (element: DrawingElementSchema) => void;
  onElementDeleted: (elementId: string) => void;
  onUserJoined: (userId: string) => void;
  onUserLeft: (userId: string) => void;
  onCursorUpdate: (userId: string, username: string, x: number, y: number) => void;
};

function applyServerMessage(message: ServerWSMessage, handlers: CollabHandlers) {
  switch (message.data.type) {
    case "ROOM_STATE":
      handlers.onRoomState(message.data.payload.elements);
      break;
    case "ELEMENT_CREATED":
      handlers.onElementCreated(message.data.payload);
      break;
    case "ELEMENT_UPDATED":
      handlers.onElementUpdated(message.data.payload);
      break;
    case "ELEMENT_DELETED":
      handlers.onElementDeleted(message.data.payload.elementId);
      break;
    case "USER_JOINED":
      handlers.onUserJoined(message.data.payload.userId);
      break;
    case "USER_LEFT":
      handlers.onUserLeft(message.data.payload.userId);
      break;
    case "CURSOR_UPDATE":
      handlers.onCursorUpdate(
        message.data.payload.userId,
        message.data.payload.username,
        message.data.payload.x,
        message.data.payload.y
      );
      break;
  }
}

export function useCollabSocket(
  roomId: string | null,
  userId: string | null,
  handlers: CollabHandlers
) {
  const socketRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef(handlers);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!roomId || !userId) return;
    const activeRoomId = roomId;
    const activeUserId = userId;

    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      if (cancelled) return;

      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        setIsConnected(true);
        socket.send(
            JSON.stringify({
              roomId: activeRoomId,
              userId: activeUserId,
              data: { type: "ROOM_JOIN", payload: { roomId: activeRoomId } },
            } satisfies ClientWSMessage)
        );
      });

      socket.addEventListener("message", (event) => {
        if (typeof event.data !== "string") return;
        try {
          const message = JSON.parse(event.data) as ServerWSMessage;
          applyServerMessage(message, handlersRef.current);
        } catch {
          // ignore malformed frames
        }
      });

      socket.addEventListener("close", (event) => {
        setIsConnected(false);
        if (!cancelled && event.code !== 4001) {
          reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      });

      socket.addEventListener("error", () => {
        socket.close();
      });
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [roomId, userId]);

  function sendMessage(data: ClientWSMessage["data"]) {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN || !roomId || !userId) return;
    socket.send(JSON.stringify({ roomId, userId, data } satisfies ClientWSMessage));
  }

  return {
    isConnected,
    sendElementCreate: (element: DrawingElementSchema) =>
      sendMessage({ type: "ELEMENT_CREATE", payload: element }),
    sendElementUpdate: (element: DrawingElementSchema) =>
      sendMessage({ type: "ELEMENT_UPDATE", payload: element }),
    sendElementDelete: (elementId: string) =>
      sendMessage({ type: "ELEMENT_DELETE", payload: { elementId } }),
    sendCursorMove: (x: number, y: number) => sendMessage({ type: "CURSOR_MOVE", payload: { x, y } }),
    sendUndo: () => sendMessage({ type: "UNDO" }),
    sendRedo: () => sendMessage({ type: "REDO" }),
  };
}

export type CollabApi = ReturnType<typeof useCollabSocket>;
