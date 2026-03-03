import type { DrawingElementSchema, PointSchema } from "@repo/schemas/types";

export type ToolContext = {
  elementsRef: React.RefObject<DrawingElementSchema[]>;
  drawingElement: React.RefObject<DrawingElementSchema | null>;
  startPosition: React.RefObject<PointSchema>;
  panRef: React.RefObject<{ x: number; y: number }>;
  zoomRef: React.RefObject<number>;
  isPanning: boolean;
  setIsPanning: React.Dispatch<React.SetStateAction<boolean>>
  draw: () => void;
  history: {
    snapshot: () => void;
    undo: () => void;
    redo: () => void;
  };
};

export type ToolHandlers = {
  onMouseDown?: (
    p: PointSchema,
    ctx: ToolContext,
    rawEvent?: React.MouseEvent<HTMLCanvasElement>
  ) => void;

  onMouseMove?: (
    p: PointSchema,
    ctx: ToolContext,
    rawEvent?: React.MouseEvent<HTMLCanvasElement>
  ) => void;

  onMouseUp?: (
    ctx: ToolContext,
    rawEvent?: React.MouseEvent<HTMLCanvasElement>
  ) => void;
};  