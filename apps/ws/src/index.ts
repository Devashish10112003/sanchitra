import { WebSocket, WebSocketServer } from "ws";
import { ClientWSMessage, ClientWSMessageSchema, DrawingElementSchema } from "@repo/schemas/types"

const wss = new WebSocketServer({ port: 8080 });

function joinRoom(roomId: string, userId: string) {

}

function createElement(roomId: string, userId: string, element: DrawingElementSchema) {

}

function updateElement(roomId: string, userId: string, element: DrawingElementSchema) {

}

wss.on("connection", (socket) => {

    socket.on("error", console.error);

    socket.on("message", (raw) => {

        const data: ClientWSMessage = JSON.parse(raw.toString());
        const parsedData = ClientWSMessageSchema.safeParse(data);

        if (parsedData.success) {

            const message = parsedData.data;
            switch (message.data.type) {
                case "ROOM_JOIN":
                    //some function to add the user to the room
                    break;
                case "ELEMENT_CREATE":
                    //
                    break;
                case "ELEMENT_UPDATE":
                    //
                    break;
                case "ELEMENT_DELETE":
                    //    
                    break;
                case "CURSOR_MOVE":
                    //
                    break;
                case "UNDO":
                    //    
                    break;
                case "REDO":
                    //
                    break;
            }
            console.log(message.data.type);
        }

        else {
            console.log(parsedData.error);
        }

        socket.send("Message received loud and clear! captain!");
    })

    socket.on("close", () => {
        console.log("running the cleanup");
    })

    socket.send("Yo from the server!");
})
