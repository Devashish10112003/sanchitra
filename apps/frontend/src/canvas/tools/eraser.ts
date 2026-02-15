import type { ToolHandlers } from "../tools";
import { isPointOnElement } from "../hitTest";

export const eraserTool: ToolHandlers = {
  onMouseDown(p, ctx) {
    ctx.history.snapshot();
    for (let i = ctx.elementsRef.current.length - 1; i >= 0; i--) {
      if (isPointOnElement(p, ctx.elementsRef.current[i])) {
        ctx.elementsRef.current.splice(i, 1);
        ctx.draw();
        return;
      }
    }
  },

  onMouseMove(p, ctx, rawEvent) {
    if (!rawEvent || rawEvent.buttons !== 1) return;

    ctx.elementsRef.current = ctx.elementsRef.current.filter(
      (el) => !isPointOnElement(p, el)
    );

    ctx.draw();
  },
};
