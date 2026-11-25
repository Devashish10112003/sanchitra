import type { DrawingElementSchema } from "@repo/schemas/types";
import { getRoughCanvas } from "./rough";
import { opacityFor } from "./style";
import { drawArrow } from "./shapes/arrow";
import { drawDiamond } from "./shapes/diamond";
import { drawEllipse } from "./shapes/ellipse";
import { drawFreehand } from "./shapes/freehand";
import { drawLine } from "./shapes/line";
import { drawRect } from "./shapes/rect";
import { drawText } from "./shapes/text";
import type { Bounds } from "./hitTest";

export function drawElement(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  el: DrawingElementSchema
) {
  const rc = getRoughCanvas(canvas);

  ctx.save();
  ctx.globalAlpha = opacityFor(el);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  switch (el.type) {
    case "rect":
      drawRect(rc, el);
      break;
    case "ellipse":
      drawEllipse(rc, el);
      break;
    case "line":
      drawLine(rc, el);
      break;
    case "arrow":
      drawArrow(rc, el);
      break;
    case "diamond":
      drawDiamond(rc, el);
      break;
    case "freehand":
      drawFreehand(rc, el);
      break;
    case "text":
      drawText(ctx, el);
      break;
  }

  ctx.restore();
}

const SELECTION_COLOR = "#6965db";

/** Dashed outline + corner handles around the selected element. `scale` = 1 / zoom keeps it a constant on-screen size. */
export function drawSelection(ctx: CanvasRenderingContext2D, b: Bounds, scale: number) {
  const pad = 6 * scale;
  const x = b.x - pad;
  const y = b.y - pad;
  const w = b.width + pad * 2;
  const h = b.height + pad * 2;

  ctx.save();
  ctx.strokeStyle = SELECTION_COLOR;
  ctx.lineWidth = 1 * scale;
  ctx.setLineDash([4 * scale, 3 * scale]);
  ctx.strokeRect(x, y, w, h);

  ctx.setLineDash([]);
  ctx.fillStyle = "#ffffff";
  const hs = 8 * scale;
  for (const [cx, cy] of [
    [x, y],
    [x + w, y],
    [x, y + h],
    [x + w, y + h],
  ]) {
    ctx.fillRect(cx - hs / 2, cy - hs / 2, hs, hs);
    ctx.strokeRect(cx - hs / 2, cy - hs / 2, hs, hs);
  }
  ctx.restore();
}
