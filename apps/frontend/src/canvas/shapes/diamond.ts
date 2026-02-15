import type { DrawingElement } from "../types/canvas";

export function drawDiamond(ctx: CanvasRenderingContext2D, el: DrawingElement) {
    const cx = el.x + el.width! / 2;
    const cy = el.y + el.height! / 2;

    ctx.beginPath();
    ctx.moveTo(cx, el.y);
    ctx.lineTo(el.x + el.width!, cy);
    ctx.lineTo(cx, el.y + el.height!);
    ctx.lineTo(el.x, cy);
    ctx.closePath();
    ctx.stroke();
}