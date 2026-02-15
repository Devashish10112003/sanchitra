// canvas/tools/text.ts
import type { ToolHandlers } from "../tools";

export const textTool = (startTextInput: (p: any) => void): ToolHandlers => ({
  onMouseDown(p,ctx) {
    ctx.history.snapshot();
    startTextInput(p);
  },
});
