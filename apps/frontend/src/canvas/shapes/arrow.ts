import type { DrawingElementSchema } from "@repo/schemas/types";
import type { RoughCanvas } from "roughjs/bin/canvas";
import { roughOptionsFor } from "../style";

export function drawArrow(rc: RoughCanvas, el: DrawingElementSchema) {
  const [p1, p2] = el.points!;
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const head = 10;
  const options = roughOptionsFor(el);

  rc.line(p1.x, p1.y, p2.x, p2.y, options);

  rc.line(
    p2.x,
    p2.y,
    p2.x - head * Math.cos(angle - Math.PI / 6),
    p2.y - head * Math.sin(angle - Math.PI / 6),
    options
  );
  rc.line(
    p2.x,
    p2.y,
    p2.x - head * Math.cos(angle + Math.PI / 6),
    p2.y - head * Math.sin(angle + Math.PI / 6),
    options
  );
}
