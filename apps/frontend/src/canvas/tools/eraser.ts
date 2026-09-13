import type { ToolHandlers } from "../tools";
import { isPointOnElement } from "../hitTest";

export const eraserTool: ToolHandlers = {
  onMouseDown(p, ctx) {
    ctx.history.snapshot();
    for (let i = ctx.elementsRef.current.length - 1; i >= 0; i--) {
      const el = ctx.elementsRef.current[i];
      if (isPointOnElement(p, el)) {
        ctx.elementsRef.current.splice(i, 1);
        ctx.collab?.onElementDelete(el.id);
        ctx.draw();
        return;
      }
    }
  },

  onMouseMove(p, ctx, rawEvent) {
    if (!rawEvent || rawEvent.buttons !== 1) return;

    const remaining = [];
    for (const el of ctx.elementsRef.current) {
      if (isPointOnElement(p, el)) {
        ctx.collab?.onElementDelete(el.id);
      } else {
        remaining.push(el);
      }
    }
    ctx.elementsRef.current = remaining;

    ctx.draw();
  },
};
