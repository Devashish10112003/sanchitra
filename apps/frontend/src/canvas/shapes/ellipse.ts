import type { DrawingElementSchema } from "@repo/schemas/types";

export function drawEllipse(ctx: CanvasRenderingContext2D, el: DrawingElementSchema) {
  const cx = el.x + el.width! / 2;
  const cy = el.y + el.height! / 2;

  ctx.beginPath();
  ctx.ellipse(
    cx,
    cy,
    Math.abs(el.width! / 2),
    Math.abs(el.height! / 2),
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();
}