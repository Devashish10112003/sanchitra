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
