import rough from "roughjs";
import type { RoughCanvas } from "roughjs/bin/canvas";

const roughCanvasCache = new WeakMap<HTMLCanvasElement, RoughCanvas>();

export function getRoughCanvas(canvas: HTMLCanvasElement): RoughCanvas {
  let rc = roughCanvasCache.get(canvas);
  if (!rc) {
    rc = rough.canvas(canvas);
    roughCanvasCache.set(canvas, rc);
  }
  return rc;
}
