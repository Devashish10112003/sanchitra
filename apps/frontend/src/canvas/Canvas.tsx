import { useRef, useState, useEffect } from "react";
import type { ToolHandlers } from "./tools";
import type { ElementTypeSchema, DrawingElementSchema } from "@repo/schemas/types";
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
import { useCollabSocket } from "../ws/useCollabSocket";
import { dotGridStyle } from "../theme";
import { drawRemoteCursor } from "./remoteCursor";
import type { ElementStyle } from "./style";

type CanvasProps = {
  activeTool: ElementTypeSchema;
  style: ElementStyle;
  roomId: string;
  userId: string;
};

function Canvas({ activeTool, style, roomId, userId }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const startPosition = useRef({ x: 0, y: 0 });
  const drawingElement = useRef<DrawingElementSchema | null>(null);
  const elementsRef = useRef<DrawingElementSchema[]>([]);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const dprRef = useRef(1);
  const [isPanning, setIsPanning] = useState(false);
  const history = useHistory(elementsRef);
  const remoteCursorsRef = useRef<Map<string, { x: number; y: number; username: string }>>(
    new Map()
  );
  const cursorMoveCountRef = useRef(0);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [zoomPercent, setZoomPercent] = useState(100);
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 30;

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
      drawElement(canvas, ctx, el);
    }

    if (drawingElement.current) {
      drawElement(canvas, ctx, drawingElement.current);
    }

    remoteCursorsRef.current.forEach((pos, cursorUserId) => {
      drawRemoteCursor(
        canvas,
        ctx,
        pos.x,
        pos.y,
        cursorUserId,
        pos.username,
        1 / zoomRef.current
      );
    });
  }

  const collab = useCollabSocket(roomId, userId, {
    onRoomState: (elements) => {
      elementsRef.current = elements;
      draw();
    },
    onElementCreated: (element) => {
      elementsRef.current.push(element);
      draw();
    },
    onElementUpdated: (element) => {
      const index = elementsRef.current.findIndex((el) => el.id === element.id);
      if (index === -1) elementsRef.current.push(element);
      else elementsRef.current[index] = element;
      draw();
    },
    onElementDeleted: (elementId) => {
      elementsRef.current = elementsRef.current.filter((el) => el.id !== elementId);
      draw();
    },
    onUserJoined: (joinedUserId) => {
      setOnlineUsers((prev) => new Set(prev).add(joinedUserId));
    },
    onUserLeft: (leftUserId) => {
      remoteCursorsRef.current.delete(leftUserId);
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(leftUserId);
        return next;
      });
      draw();
    },
    onCursorUpdate: (cursorUserId, username, x, y) => {
      remoteCursorsRef.current.set(cursorUserId, { x, y, username });
      draw();
    },
  });

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
    style,
    collab: {
      onElementCreate: collab.sendElementCreate,
      onElementDelete: collab.sendElementDelete,
    },
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          collab.sendUndo();
        }
        if (e.key === "y" || (e.shiftKey && e.key === "z")) {
          e.preventDefault();
          collab.sendRedo();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);


  useCanvasSetup(canvasRef, ctxRef, dprRef);

  useCanvasCursor({ canvasRef, activeTool, isPanning: isPanning, });


  const { startTextInput } = useTextTool({
    canvasRef,
    zoomRef,
    panRef,
    elementsRef,
    style,
    onCommit: draw,
    onElementCreate: collab.sendElementCreate,
  });

  const TOOL_REGISTRY: Record<ElementTypeSchema, ToolHandlers> = {
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

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
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

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const p = getMousePos(event);

    cursorMoveCountRef.current += 1;
    if (cursorMoveCountRef.current % 3 === 0) {
      collab.sendCursorMove(p.x, p.y);
    }

    const tool = getActiveTool();
    tool?.onMouseMove?.(p, toolCtx, event);
  }

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
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

    panRef.current.x = mouseX - ((mouseX - panRef.current.x) / oldZoom) * newZoom;
    panRef.current.y = mouseY - ((mouseY - panRef.current.y) / oldZoom) * newZoom;

    zoomRef.current = newZoom;
    setZoomPercent(Math.round(newZoom * 100));
    draw();
  }

  function setZoom(next: number) {
    zoomRef.current = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    setZoomPercent(Math.round(zoomRef.current * 100));
    draw();
  }

  function getActiveTool() {
    return TOOL_REGISTRY[activeTool];
  }


  return (
    <>
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 rounded-2xl border border-[#e0dfff] bg-white p-1.5 shadow-[0_4px_16px_rgba(105,101,219,0.18)]">
        <button
          type="button"
          title="Zoom out"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-lg text-[#1e1e1e] hover:bg-[#f5f5f9]"
          onClick={() => setZoom(zoomRef.current / 1.2)}
        >
          −
        </button>
        <span className="w-12 text-center text-sm font-medium text-[#1e1e1e]">{zoomPercent}%</span>
        <button
          type="button"
          title="Zoom in"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-lg text-[#1e1e1e] hover:bg-[#f5f5f9]"
          onClick={() => setZoom(zoomRef.current * 1.2)}
        >
          +
        </button>
      </div>
      <div className="absolute right-4 top-4 z-20 rounded-2xl border border-[#e0dfff] bg-white px-3 py-1.5 text-sm text-[#1e1e1e] shadow-[0_4px_16px_rgba(105,101,219,0.18)]">
        {collab.isConnected ? `${onlineUsers.size + 1} online` : "Connecting…"}
      </div>
      <canvas
        ref={canvasRef}
        className="h-screen w-full bg-[#fafafa]"
        style={dotGridStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />
    </>
  );
}

export default Canvas;