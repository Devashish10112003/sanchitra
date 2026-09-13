import type { DrawingElementSchema } from "@repo/schemas/types";
import type { RoughCanvas } from "roughjs/bin/canvas";
import { roughOptionsFor } from "../style";
import { roundedRectPath } from "../path";

export function drawRect(rc: RoughCanvas, el: DrawingElementSchema) {
  const x = Math.min(el.x, el.x + el.width!);
  const y = Math.min(el.y, el.y + el.height!);
  const w = Math.abs(el.width!);
  const h = Math.abs(el.height!);
  const options = roughOptionsFor(el);

  if (el.edges === "round" && w > 0 && h > 0) {
    const radius = Math.min(w, h) * 0.15;
    rc.path(roundedRectPath(x, y, w, h, radius), options);
  } else {
    rc.rectangle(x, y, w, h, options);
  }
}
