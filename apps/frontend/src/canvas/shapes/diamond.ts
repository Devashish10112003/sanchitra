import type { DrawingElementSchema } from "@repo/schemas/types";
import type { RoughCanvas } from "roughjs/bin/canvas";
import { roughOptionsFor } from "../style";
import { roundedPolygonPath } from "../path";

export function drawDiamond(rc: RoughCanvas, el: DrawingElementSchema) {
  const cx = el.x + el.width! / 2;
  const cy = el.y + el.height! / 2;
  const w = Math.abs(el.width!);
  const h = Math.abs(el.height!);

  const points: [number, number][] = [
    [cx, el.y],
    [el.x + el.width!, cy],
    [cx, el.y + el.height!],
    [el.x, cy],
  ];

  const options = roughOptionsFor(el);

  if (el.edges === "round" && w > 0 && h > 0) {
    const radius = Math.min(w, h) * 0.15;
    rc.path(roundedPolygonPath(points, radius), options);
  } else {
    rc.polygon(points, options);
  }
}
