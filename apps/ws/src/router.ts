import { ClientWSMessageSchema } from "@repo/schemas/types";
import { routeMessage } from "./handlers";

export function handleIncomingMessage(socket: WebSocket, raw: Buffer) {
    const parsed = ClientWSMessageSchema.safeParse(
        JSON.parse(raw.toString())
    );

    if (!parsed.success) {
        //error message return schema
        return;
    }

    const message = parsed.data

    routeMessage(socket, message);
}