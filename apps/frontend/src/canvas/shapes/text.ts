import type { DrawingElementSchema } from "@repo/schemas/types";

export function drawText(ctx: CanvasRenderingContext2D, el: DrawingElementSchema) {
  ctx.font = "16px sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText(el.text ?? "", el.x, el.y);
}