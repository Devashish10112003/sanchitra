import type { DrawingElementSchema, PointSchema } from "@repo/schemas/types";
import type { ElementStyle } from "./style";

export type ToolContext = {
  elementsRef: React.RefObject<DrawingElementSchema[]>;
  drawingElement: React.RefObject<DrawingElementSchema | null>;
  startPosition: React.RefObject<PointSchema>;
  panRef: React.RefObject<{ x: number; y: number }>;
  zoomRef: React.RefObject<number>;
  isPanning: boolean;
  setIsPanning: React.Dispatch<React.SetStateAction<boolean>>
  draw: () => void;
  selectedIdRef: React.RefObject<string | null>;
  dragRef: React.RefObject<{ last: PointSchema; moved: boolean } | null>;
  style: ElementStyle;
  history: {
    snapshot: () => void;
    undo: () => void;
    redo: () => void;
  };
  collab?: {
    onElementCreate: (element: DrawingElementSchema) => void;
    onElementUpdate: (element: DrawingElementSchema) => void;
    onElementDelete: (elementId: string) => void;
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