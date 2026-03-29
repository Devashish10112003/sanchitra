import { ClientWSMessageSchema } from "@repo/schemas/types";
import type { RawData, WebSocket } from "ws";
import { routeMessage } from "./handlers";

function rawToString(raw: RawData): string {
    if (typeof raw === "string") return raw;
    if (raw instanceof Buffer) return raw.toString();
    if (Array.isArray(raw)) return Buffer.concat(raw).toString();
    return Buffer.from(new Uint8Array(raw)).toString();
}

export async function handleIncomingMessage(socket: WebSocket, raw: RawData) {
    let parsedJson: unknown;
    try {
        parsedJson = JSON.parse(rawToString(raw));
    } catch {
        return;
    }

    const parsed = ClientWSMessageSchema.safeParse(parsedJson);
    if (!parsed.success) return;

    await routeMessage(socket, parsed.data);
}
