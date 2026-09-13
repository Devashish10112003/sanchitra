import type { DrawingElementSchema } from "@repo/schemas/types";
import type { RoughCanvas } from "roughjs/bin/canvas";
import { roughOptionsFor } from "../style";

export function drawFreehand(rc: RoughCanvas, el: DrawingElementSchema) {
  const pts = el.points!;
  if (pts.length < 2) return;

  const options = { ...roughOptionsFor(el), fill: undefined, fillStyle: undefined };
  rc.curve(
    pts.map((p) => [p.x, p.y]),
    options
  );
}
