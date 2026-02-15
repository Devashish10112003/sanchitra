// canvas/tools/diamond.ts
import type { ToolHandlers } from "../tools";

export const diamondTool: ToolHandlers = {
  onMouseDown(p, ctx) {
    ctx.history.snapshot();
    ctx.drawingElement.current = {
      id: crypto.randomUUID(),
      type: "diamond",
      x: p.x,
      y: p.y,
      width: 0,
      height: 0,
    };
    ctx.startPosition.current = p;
  },

  onMouseMove(p, ctx) {
    const el = ctx.drawingElement.current;
    if (!el) return;

    el.width = p.x - ctx.startPosition.current.x;
    el.height = p.y - ctx.startPosition.current.y;
    ctx.draw();
  },

  onMouseUp(ctx) {
    if (!ctx.drawingElement.current) return;

    ctx.elementsRef.current.push(ctx.drawingElement.current);
    ctx.drawingElement.current = null;
    ctx.draw();
  },
};
