import type { ToolHandlers } from "../tools";

export const handTool: ToolHandlers = {
  onMouseDown(_, ctx, rawEvent) {
    if (!rawEvent) return;
    ctx.setIsPanning(true);
  },

  onMouseMove(_, ctx, rawEvent) {
    if (!ctx.isPanning || !rawEvent) return;

    ctx.panRef.current.x += rawEvent.movementX;
    ctx.panRef.current.y += rawEvent.movementY;
    ctx.draw();
  },

  onMouseUp(ctx) {
    ctx.setIsPanning(false);
  },
};
