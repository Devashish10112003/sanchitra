import { ServerWSMessage } from "@repo/schemas/types";

export function createServerMessage(
    type: ServerWSMessage["data"]["type"],
    payload: unknown,
    meta: { roomId: string; userId: string }
): ServerWSMessage {
    return {
        roomId: meta.roomId,
        userId: meta.userId,
        data: {
            type,
            payload,
        } as ServerWSMessage["data"],
    };
}
