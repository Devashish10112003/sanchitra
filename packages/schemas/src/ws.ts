import { z } from "zod";
import { drawingElementSchema, pointSchema } from "./frontend";

const ClientMessageSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("ROOM_JOIN"),
        payload: z.object({
            roomId: z.string(),
        }),
    }),
    z.object({
        type: z.literal("ELEMENT_CREATE"),
        payload: drawingElementSchema,
    }),

    z.object({
        type: z.literal("ELEMENT_UPDATE"),
        payload: drawingElementSchema,
    }),

    z.object({
        type: z.literal("ELEMENT_DELETE"),
        payload: z.object({
            elementId: z.string(),
        }),
    }),

    z.object({
        type: z.literal("CURSOR_MOVE"),
        payload: pointSchema,
    }),

    z.object({
        type: z.literal("UNDO"),
    }),

    z.object({
        type: z.literal("REDO"),
    }),
]);

const ServerMessageSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("ROOM_STATE"),
        payload: z.object({
            elements: z.array(drawingElementSchema),
        }),
    }),

    z.object({
        type: z.literal("ELEMENT_CREATED"),
        payload: drawingElementSchema,
    }),

    z.object({
        type: z.literal("ELEMENT_UPDATED"),
        payload: drawingElementSchema,
    }),

    z.object({
        type: z.literal("ELEMENT_DELETED"),
        payload: z.object({
            elementId: z.string(),
        }),
    }),

    z.object({
        type: z.literal("USER_JOINED"),
        payload: z.object({
            userId: z.string(),
        }),
    }),

    z.object({
        type: z.literal("USER_LEFT"),
        payload: z.object({
            userId: z.string(),
        }),
    }),

    z.object({
        type: z.literal("CURSOR_UPDATE"),
        payload: z.object({
            userId: z.string(),
            x: z.number(),
            y: z.number(),
        }),
    }),
]);


const WSMessageSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        roomId: z.string(),
        userId: z.string(),
        data: dataSchema,
    });

export const ClientWSMessageSchema = WSMessageSchema(ClientMessageSchema);
export const ServerWSMessageSchema = WSMessageSchema(ServerMessageSchema);

export type ClientWSMessage = z.infer<typeof ClientWSMessageSchema>;
export type ServerWSMessage = z.infer<typeof ServerWSMessageSchema>;