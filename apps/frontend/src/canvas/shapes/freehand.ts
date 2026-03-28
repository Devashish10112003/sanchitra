import type { DrawingElementSchema } from "@repo/schemas/types";

export function drawFreehand(ctx: CanvasRenderingContext2D, el: DrawingElementSchema) {
  const pts = el.points!;
  if (pts.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.stroke();
}