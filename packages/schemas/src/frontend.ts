import { z } from "zod";

export const pointSchema = z.object({
    x: z.number(),
    y: z.number()
})

export const elementTypeSchema = z.enum(["rect", "ellipse", "line", "arrow", "diamond", "freehand", "text", "hand", "eraser"]);

export const strokeStyleSchema = z.enum(["solid", "dashed", "dotted"]);
export const sloppinessSchema = z.enum(["architect", "artist", "cartoonist"]);
export const edgesSchema = z.enum(["sharp", "round"]);

export const drawingElementSchema = z.object({
    id: z.string(),
    type: elementTypeSchema,
    x: z.number(),
    y: z.number(),

    height: z.number().optional(),
    width: z.number().optional(),
    points: z.array(pointSchema).optional(),
    text: z.string().optional(),

    strokeColor: z.string().optional(),
    backgroundColor: z.string().optional(),
    strokeWidth: z.number().optional(),
    strokeStyle: strokeStyleSchema.optional(),
    sloppiness: sloppinessSchema.optional(),
    edges: edgesSchema.optional(),
    opacity: z.number().min(0).max(100).optional(),
});

export type PointSchema = z.infer<typeof pointSchema>;
export type ElementTypeSchema = z.infer<typeof elementTypeSchema>
export type StrokeStyleSchema = z.infer<typeof strokeStyleSchema>;
export type SloppinessSchema = z.infer<typeof sloppinessSchema>;
export type EdgesSchema = z.infer<typeof edgesSchema>;
export type DrawingElementSchema = z.infer<typeof drawingElementSchema>;