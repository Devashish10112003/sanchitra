import { ClientWSMessage } from "@repo/schemas/types";

export function routeMessage(socket: WebSocket, message: ClientWSMessage) {
    switch (message.data.type) {
        case "ROOM_JOIN":
            //handle join room
            break;

        case "ELEMENT_CREATE":
            //handle leave room
            break;

        case "ELEMENT_UPDATE":
            //handle send message
            break;

        default:
            //handle unknown message type
            break;
    }
}