import type { ToolHandlers } from "../tools";

export const arrowTool: ToolHandlers = {
  onMouseDown(p, ctx) {
    ctx.history.snapshot();
    ctx.drawingElement.current = {
      id: crypto.randomUUID(),
      type: "arrow",
      x: p.x,
      y: p.y,
      points: [{ x: p.x, y: p.y }, { x: p.x, y: p.y }],
    };
  },

  onMouseMove(p, ctx) {
    const el = ctx.drawingElement.current;
    if (!el || !el.points) return;

    el.points[1] = { x: p.x, y: p.y };
    ctx.draw();
  },

  onMouseUp(ctx) {
    if (!ctx.drawingElement.current) return;

    ctx.elementsRef.current.push(ctx.drawingElement.current);
    ctx.drawingElement.current = null;
    ctx.draw();
  },
};
