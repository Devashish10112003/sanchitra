import type { PointSchema, DrawingElementSchema } from "@repo/schemas/types";


function isPointInRect(p: PointSchema, el: DrawingElementSchema) {
  const x1 = Math.min(el.x, el.x + el.width!);
  const y1 = Math.min(el.y, el.y + el.height!);
  const x2 = Math.max(el.x, el.x + el.width!);
  const y2 = Math.max(el.y, el.y + el.height!);

  return p.x >= x1 && p.x <= x2 && p.y >= y1 && p.y <= y2;
}

function isPointInEllipse(p: PointSchema, el: DrawingElementSchema) {
  const rx = Math.abs(el.width! / 2);
  const ry = Math.abs(el.height! / 2);
  const cx = el.x + el.width! / 2;
  const cy = el.y + el.height! / 2;

  return (
    ((p.x - cx) ** 2) / (rx ** 2) +
    ((p.y - cy) ** 2) / (ry ** 2)
    <= 1
  );
}

function distanceToSegment(p: PointSchema, a: PointSchema, b: PointSchema) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  const t =
    ((p.x - a.x) * dx + (p.y - a.y) * dy) /
    (dx * dx + dy * dy);

  const clamped = Math.max(0, Math.min(1, t));
  const x = a.x + clamped * dx;
  const y = a.y + clamped * dy;

  return Math.hypot(p.x - x, p.y - y);
}

function isPointNearLine(p: PointSchema, el: DrawingElementSchema) {
  const [a, b] = el.points!;
  return distanceToSegment(p, a, b) < 6; // eraser radius
}

function isPointNearFreehand(p: PointSchema, el: DrawingElementSchema) {
  const pts = el.points!;
  for (let i = 0; i < pts.length - 1; i++) {
    if (distanceToSegment(p, pts[i], pts[i + 1]) < 6) {
      return true;
    }
  }
  return false;
}

export function isPointOnElement(p: PointSchema, el: DrawingElementSchema) {
  switch (el.type) {
    case "rect":
    case "diamond":
      return isPointInRect(p, el);

    case "ellipse":
      return isPointInEllipse(p, el);

    case "line":
    case "arrow":
      return isPointNearLine(p, el);

    case "freehand":
      return isPointNearFreehand(p, el);

    case "text": {
      const b = getElementBounds(el);
      return p.x >= b.x && p.x <= b.x + b.width && p.y >= b.y && p.y <= b.y + b.height;
    }

    default:
      return false;
  }
}

export type Bounds = { x: number; y: number; width: number; height: number };

const TEXT_FONT = "16px sans-serif";
const TEXT_LINE_HEIGHT = 20;
let measureCtx: CanvasRenderingContext2D | null = null;

function measureTextWidth(text: string) {
  if (!measureCtx) measureCtx = document.createElement("canvas").getContext("2d");
  if (!measureCtx) return text.length * 9;
  measureCtx.font = TEXT_FONT;
  return measureCtx.measureText(text).width;
}

export function getElementBounds(el: DrawingElementSchema): Bounds {
  if (el.points && el.points.length > 0) {
    const xs = el.points.map((pt) => pt.x);
    const ys = el.points.map((pt) => pt.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    return { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY };
  }

  if (el.type === "text") {
    return {
      x: el.x,
      y: el.y,
      width: Math.max(measureTextWidth(el.text ?? ""), 10),
      height: TEXT_LINE_HEIGHT,
    };
  }

  const w = el.width ?? 0;
  const h = el.height ?? 0;
  return {
    x: Math.min(el.x, el.x + w),
    y: Math.min(el.y, el.y + h),
    width: Math.abs(w),
    height: Math.abs(h),
  };
}

/** Returns the topmost element under the point, if any. */
export function findElementAt(p: PointSchema, elements: DrawingElementSchema[]) {
  for (let i = elements.length - 1; i >= 0; i--) {
    if (isPointOnElement(p, elements[i])) return elements[i];
  }
  return null;
}

export function translateElement(el: DrawingElementSchema, dx: number, dy: number) {
  el.x += dx;
  el.y += dy;
  if (el.points) {
    for (const pt of el.points) {
      pt.x += dx;
      pt.y += dy;
    }
  }
}
