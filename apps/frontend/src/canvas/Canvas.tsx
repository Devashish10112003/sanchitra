import { useRef,useState,useEffect } from "react";
import type { ToolHandlers } from "./tools";
import type {ElementType,DrawingElement } from "./types/canvas";
import { useCanvasSetup } from "./useCanvasSetp";
import { drawElement } from "./draw";
import { arrowTool } from "./tools/arrow";
import { diamondTool } from "./tools/diamond";
import { ellipseTool } from "./tools/ellipse";
import { eraserTool } from "./tools/eraser";
import { freehandTool } from "./tools/freehand";
import { handTool } from "./tools/hand";
import { lineTool } from "./tools/line";
import { rectTool } from "./tools/rect";
import { textTool } from "./tools/text";
import { useTextTool } from "./useTextTool";
import { useCanvasCursor } from "./useCanvasCursor";
import { useHistory } from "./useHistory";

type CanvasProps = {
  activeTool: ElementType;
};

function Canvas({ activeTool }: CanvasProps) {

  const canvasRef=useRef<HTMLCanvasElement|null>(null);
  const ctxRef=useRef<CanvasRenderingContext2D|null>(null);
  const startPosition=useRef({x:0,y:0});
  const drawingElement=useRef<DrawingElement|null>(null);
  const elementsRef=useRef<DrawingElement[]>([]);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const dprRef = useRef(1);
  const [isPanning, setIsPanning] = useState(false);
  const history = useHistory(elementsRef);
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 30;
  const toolCtx = {
    elementsRef,
    drawingElement,
    startPosition,
    zoomRef,
    panRef,
    isPanning,
    setIsPanning,
    draw,
    history,
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          history.undo();
          draw();
        }
        if (e.key === "y" || (e.shiftKey && e.key === "z")) {
          e.preventDefault();
          history.redo();
          draw();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);


  useCanvasSetup(canvasRef,ctxRef,dprRef);

  useCanvasCursor({canvasRef,activeTool,isPanning:isPanning,});


  const { startTextInput } = useTextTool({
    canvasRef,
    zoomRef,
    panRef,
    elementsRef,
    onCommit: draw,
  });

  const TOOL_REGISTRY: Record<ElementType, ToolHandlers> = {
    rect: rectTool,
    ellipse: ellipseTool,
    diamond: diamondTool,
    line: lineTool,
    arrow: arrowTool,
    freehand: freehandTool,
    hand: handTool,
    eraser: eraserTool,
    text: textTool(startTextInput),
  };

  function getMousePos(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();

    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    return {
      x: (screenX - panRef.current.x) / zoomRef.current,
      y: (screenY - panRef.current.y) / zoomRef.current,
    };
  }

  function draw() {
    const canvas = canvasRef.current!;
    const ctx = ctxRef.current!;
    const dpr = dprRef.current;

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.setTransform(
      dpr * zoomRef.current,
      0,
      0,
      dpr * zoomRef.current,
      dpr * panRef.current.x,
      dpr * panRef.current.y
    );

    for (const el of elementsRef.current) {
      drawElement(ctx, el);
    }

    if (drawingElement.current) {
      drawElement(ctx, drawingElement.current);
    }
  }

  const handleMouseDown=(event: React.MouseEvent<HTMLCanvasElement>)=>{
    const p = getMousePos(event);
    const tool = getActiveTool();
    if (activeTool === "text") {
      event.preventDefault();
      event.stopPropagation();
      tool?.onMouseDown?.(p, toolCtx, event);
      return;
    }
    tool?.onMouseDown?.(p, toolCtx, event);
  }

  const handleMouseMove=(event: React.MouseEvent<HTMLCanvasElement>)=>{
    const p = getMousePos(event);
    const tool = getActiveTool();
    tool?.onMouseMove?.(p, toolCtx, event);
  }

  const handleMouseUp=(event: React.MouseEvent<HTMLCanvasElement>)=>{
    const tool = getActiveTool();
    tool?.onMouseUp?.(toolCtx, event);
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const zoomFactor = 1.1;
    const oldZoom = zoomRef.current;

    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const direction = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
    let newZoom = oldZoom * direction;

    newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));

    panRef.current.x =mouseX - ((mouseX - panRef.current.x) / oldZoom) * newZoom;
    panRef.current.y =mouseY - ((mouseY - panRef.current.y) / oldZoom) * newZoom;

    zoomRef.current = newZoom;
    draw();
  }

  function setZoom(next: number) {
    zoomRef.current = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    draw();
  }

  function getActiveTool() {
    return TOOL_REGISTRY[activeTool];
  }


  return (
    <>
      <div className="absolute bg-white flex mt-50">
        <button className="py-2 px-2 border-2 border-solid" onClick={() => { setZoom(zoomRef.current * 1.2)}}>+</button>
        <button className="py-2 px-2 border-2 border-solid" onClick={() => { setZoom(zoomRef.current / 1.2) }}>-</button>
      </div>
      <canvas 
        ref={canvasRef} 
        className="h-screen w-full bg-black" 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />
    </>
  );
}

export default Canvas;