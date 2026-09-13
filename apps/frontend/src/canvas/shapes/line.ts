import type { DrawingElementSchema } from "@repo/schemas/types";
import type { RoughCanvas } from "roughjs/bin/canvas";
import { roughOptionsFor } from "../style";

export function drawLine(rc: RoughCanvas, el: DrawingElementSchema) {
  const [p1, p2] = el.points!;
  rc.line(p1.x, p1.y, p2.x, p2.y, roughOptionsFor(el));
}
