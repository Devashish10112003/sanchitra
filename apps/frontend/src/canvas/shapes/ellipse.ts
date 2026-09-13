import type { DrawingElementSchema } from "@repo/schemas/types";
import type { RoughCanvas } from "roughjs/bin/canvas";
import { roughOptionsFor } from "../style";

export function drawEllipse(rc: RoughCanvas, el: DrawingElementSchema) {
  const cx = el.x + el.width! / 2;
  const cy = el.y + el.height! / 2;

  rc.ellipse(cx, cy, Math.abs(el.width!), Math.abs(el.height!), roughOptionsFor(el));
}
