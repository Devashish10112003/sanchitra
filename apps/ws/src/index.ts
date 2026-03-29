import { WebSocketServer } from "ws";
import { handleSocketDisconnect } from "./handlers";
import { handleIncomingMessage } from "./router";
import { disconnectPubSub, registerConnection } from "./state/connectionManager";

const port = Number(process.env.WS_PORT ?? 8080);
const wss = new WebSocketServer({ port });

wss.on("connection", (socket) => {
    registerConnection(socket);

    socket.on("message", (raw) => {
        void handleIncomingMessage(socket, raw);
    });

    socket.on("close", () => {
        void handleSocketDisconnect(socket);
    });

    socket.on("error", (error) => {
        console.error("[ws] socket error", error);
    });
});

wss.on("listening", () => {
    console.log(`[ws] WebSocket server listening on port ${port}`);
});

async function shutdown() {
    await disconnectPubSub();
    wss.close();
}

process.on("SIGINT", () => {
    void shutdown();
});

process.on("SIGTERM", () => {
    void shutdown();
});
