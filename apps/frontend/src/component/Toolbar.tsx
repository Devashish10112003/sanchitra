import type { ElementType } from "../canvas/types/canvas";
import {IconSquare,IconCircle,IconSquareRotated,IconPencil,IconTypography,IconArrowNarrowRight,IconMinus,IconHandStop,IconEraser} from "@tabler/icons-react";


type ToolbarProps = {
  onSelectTool: (tool: ElementType) => void;
};

export function Toolbar({onSelectTool }: ToolbarProps) {
    return(
        <div className="absolute bg-white flex">
        <button className="py-2 px-2 border-2 border-solid" onClick={()=>onSelectTool("hand")}><IconHandStop className="h-4 w-4" /></button>
        <button className="py-2 px-2 border-2 border-solid" onClick={()=>onSelectTool("rect")}><IconSquare className="h-4 w-4" /></button>
        <button className="py-2 px-2 border-2 border-solid" onClick={()=>onSelectTool("ellipse")}><IconCircle className="h-4 w-4" /></button>
        <button className="py-2 px-2 border-2 border-solid" onClick={()=>onSelectTool("line")}><IconMinus className="h-4 w-4" /></button>
        <button className="py-2 px-2 border-2 border-solid" onClick={()=>onSelectTool("arrow")}><IconArrowNarrowRight className="h-4 w-4" /></button>
        <button className="py-2 px-2 border-2 border-solid" onClick={()=>onSelectTool("diamond")}><IconSquareRotated className="h-4 w-4" /></button>
        <button className="py-2 px-2 border-2 border-solid" onClick={()=>onSelectTool("text")}><IconTypography className="h-4 w-4" /></button>
        <button className="py-2 px-2 border-2 border-solid" onClick={()=>onSelectTool("freehand")}><IconPencil className="h-4 w-4" /></button>
        <button className="py-2 px-2 border-2 border-solid" onClick={()=>onSelectTool("eraser")}><IconEraser className="h-4 w-4" /></button>
      </div>
    );
}