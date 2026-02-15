import type { DrawingElement } from "../types/canvas";

export function drawArrow(ctx: CanvasRenderingContext2D, el: DrawingElement) {
    const [p1, p2] = el.points!;
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const head = 10;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(
      p2.x - head * Math.cos(angle - Math.PI / 6),
      p2.y - head * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      p2.x - head * Math.cos(angle + Math.PI / 6),
      p2.y - head * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  }