import type { ToolHandlers } from "../tools";
import { findElementAt, translateElement } from "../hitTest";

export const selectTool: ToolHandlers = {
  onMouseDown(p, ctx) {
    const hit = findElementAt(p, ctx.elementsRef.current);
    ctx.selectedIdRef.current = hit?.id ?? null;
    ctx.dragRef.current = hit ? { last: p, moved: false } : null;
    ctx.draw();
  },

  onMouseMove(p, ctx, rawEvent) {
    const drag = ctx.dragRef.current;
    if (!drag || !rawEvent || rawEvent.buttons !== 1) return;

    const el = ctx.elementsRef.current.find((e) => e.id === ctx.selectedIdRef.current);
    if (!el) return;

    const dx = p.x - drag.last.x;
    const dy = p.y - drag.last.y;
    if (dx === 0 && dy === 0) return;

    if (!drag.moved) {
      ctx.history.snapshot();
      drag.moved = true;
    }

    translateElement(el, dx, dy);
    drag.last = p;
    ctx.draw();
  },

  onMouseUp(ctx) {
    const drag = ctx.dragRef.current;
    ctx.dragRef.current = null;
    if (!drag?.moved) return;

    const el = ctx.elementsRef.current.find((e) => e.id === ctx.selectedIdRef.current);
    if (el) ctx.collab?.onElementUpdate(el);
  },
};
