import type { DrawingElement } from "../types/canvas";

export function drawText(ctx: CanvasRenderingContext2D, el: DrawingElement) {
    ctx.font = "16px sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(el.text ?? "", el.x, el.y);
  }