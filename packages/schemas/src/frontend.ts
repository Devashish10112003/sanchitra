import { z } from "zod";

export const pointSchema = z.object({
    x: z.number(),
    y: z.number()
})

export const elementTypeSchema = z.enum(["rect", "ellipse", "line", "arrow", "diamond", "freehand", "text", "hand", "eraser"]);

export const drawingElementSchema = z.object({
    id: z.string(),
    type: elementTypeSchema,
    x: z.number(),
    y: z.number(),

    height: z.number().optional(),
    width: z.number().optional(),
    points: z.array(pointSchema).optional(),
    text: z.string().optional()
});

export type PointSchema = z.infer<typeof pointSchema>;
export type ElementTypeSchema = z.infer<typeof elementTypeSchema>
export type DrawingElementSchema = z.infer<typeof drawingElementSchema>;