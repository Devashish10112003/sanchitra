import type { DrawingElement } from "./types/canvas";
import { drawArrow } from "./shapes/arrow";
import { drawDiamond } from "./shapes/diamond";
import { drawEllipse } from "./shapes/ellipse";
import { drawFreehand } from "./shapes/freehand";
import { drawLine } from "./shapes/line";
import { drawRect } from "./shapes/rect";
import { drawText } from "./shapes/text";

export function drawElement(ctx: CanvasRenderingContext2D, el: DrawingElement) {
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";

    switch (el.type) {
      case "rect":
        drawRect(ctx, el);
        break;
      case "ellipse":
        drawEllipse(ctx, el);
        break;
      case "line":
        drawLine(ctx, el);
        break;
      case "arrow":
        drawArrow(ctx, el);
        break;
      case "diamond":
        drawDiamond(ctx, el);
        break;
      case "freehand":
        drawFreehand(ctx, el);
        break;
      case "text":
        drawText(ctx, el);
        break;
    }
}