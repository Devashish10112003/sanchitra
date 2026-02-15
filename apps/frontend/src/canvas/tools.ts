import type { DrawingElement,Point } from "./types/canvas";

export type ToolContext = {
  elementsRef: React.RefObject<DrawingElement[]>;
  drawingElement: React.RefObject<DrawingElement | null>;
  startPosition: React.RefObject<Point>;
  panRef: React.RefObject<{ x: number; y: number }>;
  zoomRef: React.RefObject<number>;
  isPanning: boolean;
  setIsPanning:React.Dispatch<React.SetStateAction<boolean>>
  draw: () => void;
  history: {
    snapshot: () => void;
    undo: () => void;
    redo: () => void;
  };
};

export type ToolHandlers = {
  onMouseDown?: (
    p: Point,
    ctx: ToolContext,
    rawEvent?: React.MouseEvent<HTMLCanvasElement>
  ) => void;

  onMouseMove?: (
    p: Point,
    ctx: ToolContext,
    rawEvent?: React.MouseEvent<HTMLCanvasElement>
  ) => void;

  onMouseUp?: (
    ctx: ToolContext,
    rawEvent?: React.MouseEvent<HTMLCanvasElement>
  ) => void;
};  