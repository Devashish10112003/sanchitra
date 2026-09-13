import type { DrawingElementSchema } from "@repo/schemas/types";
import { DEFAULT_STYLE } from "../style";

export function drawText(ctx: CanvasRenderingContext2D, el: DrawingElementSchema) {
  ctx.font = "16px sans-serif";
  ctx.textBaseline = "top";
  ctx.fillStyle = el.strokeColor ?? DEFAULT_STYLE.strokeColor;
  ctx.fillText(el.text ?? "", el.x, el.y);
}
