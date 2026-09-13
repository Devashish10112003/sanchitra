import type { ElementTypeSchema } from "@repo/schemas/types";
import {
  IconSquare,
  IconCircle,
  IconSquareRotated,
  IconPencil,
  IconTypography,
  IconArrowNarrowRight,
  IconMinus,
  IconHandStop,
  IconEraser,
} from "@tabler/icons-react";

type ToolbarProps = {
  activeTool: ElementTypeSchema;
  onSelectTool: (tool: ElementTypeSchema) => void;
};

const TOOLS: { type: ElementTypeSchema; label: string; icon: typeof IconSquare }[] = [
  { type: "hand", label: "Pan", icon: IconHandStop },
  { type: "rect", label: "Rectangle", icon: IconSquare },
  { type: "diamond", label: "Diamond", icon: IconSquareRotated },
  { type: "ellipse", label: "Ellipse", icon: IconCircle },
  { type: "arrow", label: "Arrow", icon: IconArrowNarrowRight },
  { type: "line", label: "Line", icon: IconMinus },
  { type: "freehand", label: "Draw", icon: IconPencil },
  { type: "text", label: "Text", icon: IconTypography },
  { type: "eraser", label: "Eraser", icon: IconEraser },
];

export function Toolbar({ activeTool, onSelectTool }: ToolbarProps) {
  return (
    <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-[#e0dfff] bg-white p-1.5 shadow-[0_4px_16px_rgba(105,101,219,0.18)]">
      {TOOLS.map(({ type, label, icon: Icon }) => {
        const isActive = activeTool === type;
        return (
          <button
            key={type}
            type="button"
            title={label}
            onClick={() => onSelectTool(type)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
              isActive ? "bg-[#eeedfb] text-[#6965db]" : "text-[#1e1e1e] hover:bg-[#f5f5f9]"
            }`}
          >
            <Icon className="h-5 w-5" stroke={1.75} />
          </button>
        );
      })}
    </div>
  );
}
