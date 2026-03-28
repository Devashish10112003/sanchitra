import type { DrawingElementSchema } from "@repo/schemas/types";

export function drawLine(ctx: CanvasRenderingContext2D, el: DrawingElementSchema) {
  const [p1, p2] = el.points!;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}