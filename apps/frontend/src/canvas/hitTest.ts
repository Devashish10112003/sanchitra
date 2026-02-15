import type { Point,DrawingElement } from "./types/canvas";

function isPointInRect(p: Point, el: DrawingElement) {
    const x1 = Math.min(el.x, el.x + el.width!);
    const y1 = Math.min(el.y, el.y + el.height!);
    const x2 = Math.max(el.x, el.x + el.width!);
    const y2 = Math.max(el.y, el.y + el.height!);

    return p.x >= x1 && p.x <= x2 && p.y >= y1 && p.y <= y2;
  }

function isPointInEllipse(p: Point, el: DrawingElement) {
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

function distanceToSegment(p: Point, a: Point, b: Point) {
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

function isPointNearLine(p: Point, el: DrawingElement) {
    const [a, b] = el.points!;
    return distanceToSegment(p, a, b) < 6; // eraser radius
  }

function isPointNearFreehand(p: Point, el: DrawingElement) {
    const pts = el.points!;
    for (let i = 0; i < pts.length - 1; i++) {
      if (distanceToSegment(p, pts[i], pts[i + 1]) < 6) {
        return true;
      }
    }
    return false;
  }

export  function isPointOnElement(p: Point, el: DrawingElement) {
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

      case "text":
        return isPointInRect(
          p,
          { ...el, width: 40, height: 20 }
        );

      default:
        return false;
    }
  }