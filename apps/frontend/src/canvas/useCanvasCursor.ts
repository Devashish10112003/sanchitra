import { useEffect } from "react";
import type { ElementType } from "./types/canvas";

type Params = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  activeTool: ElementType;
  isPanning?: boolean;
};

export function useCanvasCursor({
  canvasRef,
  activeTool,
  isPanning = false,
}: Params) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    switch (activeTool) {
      case "hand":
        canvas.style.cursor = isPanning ? "grabbing" : "grab";
        break;

      case "text":
        canvas.style.cursor = "text";
        break;

      case "eraser":
        canvas.style.cursor = "crosshair";
        break;

      case "rect":
      case "ellipse":
      case "diamond":
      case "line":
      case "arrow":
      case "freehand":
        canvas.style.cursor = "crosshair";
        break;

      default:
        canvas.style.cursor = "default";
    }
  }, [canvasRef, activeTool, isPanning]);
}
