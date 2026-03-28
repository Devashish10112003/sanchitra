import { ServerWSMessage } from "@repo/schemas/types";

export function createServerMessage(
    type: ServerWSMessage["data"]["type"],
    payload: any,
    meta: { roomId: string; userId: string }
): ServerWSMessage {
    return {
        roomId: meta.roomId,
        userId: meta.userId,
        data: {
            type,
            payload,
        },
    };
}