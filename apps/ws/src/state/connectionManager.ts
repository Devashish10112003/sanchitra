const socketToUser = new Map<WebSocket, string>();
const socketToRooms = new Map<WebSocket, Set<string>>();

export function registerConnection(socket: WebSocket) {
    //initialize metadata
}

export function attachUser(socket: WebSocket, userId: string) {

}

export function trackRoom(socket: WebSocket, roomId: string) {

}

export function cleanupConnection(socket: WebSocket) {

}