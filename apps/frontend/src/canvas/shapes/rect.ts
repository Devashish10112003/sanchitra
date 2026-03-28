import type { DrawingElementSchema } from "@repo/schemas/types";

export function drawRect(ctx: CanvasRenderingContext2D, el: DrawingElementSchema) {
  const x = Math.min(el.x, el.x + el.width!);
  const y = Math.min(el.y, el.y + el.height!);
  const w = Math.abs(el.width!);
  const h = Math.abs(el.height!);

  ctx.strokeRect(x, y, w, h);
}
