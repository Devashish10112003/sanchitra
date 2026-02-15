import { useRef } from "react";
import type { Point,DrawingElement } from "./types/canvas";

type UseTextToolParams = {
  canvasRef: React.RefObject<HTMLCanvasElement|null>;
  zoomRef: React.RefObject<number>;
  panRef: React.RefObject<{ x: number; y: number }>;
  elementsRef: React.RefObject<DrawingElement[]>;
  onCommit?: () => void;
};
export function useTextTool({
  canvasRef,
  zoomRef,
  panRef,
  elementsRef,
  onCommit,
}: UseTextToolParams) {
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);
  const textPositionRef = useRef<Point | null>(null);
  const keydownRef = useRef<(e: KeyboardEvent) => void|null>(null);
  const blurRef = useRef<() => void|null>(null);

  function commitText() {
    const textarea = textInputRef.current;
    const pos = textPositionRef.current;
    if (!textarea || !pos) return;

    const value = textarea.value.trim();

    if (value) {
      elementsRef.current.push({
        id: crypto.randomUUID(),
        type: "text",
        x: pos.x,
        y: pos.y,
        text: value,
      });
    }

    textarea.removeEventListener("keydown", keydownRef.current!);
    textarea.removeEventListener("blur", blurRef.current!);
    textarea.remove();
    textInputRef.current = null;
    textPositionRef.current = null;
    
    onCommit?.();
  }

  function startTextInput(p: Point) {
    if (textInputRef.current) {
      commitText();
      return;
    }

    const canvasRect = canvasRef.current!.getBoundingClientRect();

    const screenX =
      p.x * zoomRef.current + panRef.current.x + canvasRect.left;
    const screenY =
      p.y * zoomRef.current + panRef.current.y + canvasRect.top;

    const textarea = document.createElement("textarea");

    textarea.style.position = "fixed";
    textarea.style.left = `${screenX}px`;
    textarea.style.top = `${screenY}px`;
    textarea.style.background = "transparent";
    textarea.style.color = "white";
    textarea.style.font = "16px sans-serif";
    textarea.style.padding = "4px";
    textarea.style.border = "none"; 
    textarea.style.borderRadius = "4px";
    textarea.style.zIndex = "9999";
    textarea.style.resize = "none";
    textarea.style.outline = "none";      
    textarea.style.boxShadow = "none";  
    textarea.style.padding = "0";   

    document.body.appendChild(textarea);
    textarea.focus();

    textInputRef.current = textarea;
    textPositionRef.current = p;

    keydownRef.current = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        commitText();
      }
      if (e.key === "Escape") {
        textarea.remove();
        textInputRef.current = null;
        textPositionRef.current = null;
      }
    };

    blurRef.current = () => commitText();

    textarea.addEventListener("keydown", keydownRef.current);
    textarea.addEventListener("blur", blurRef.current);
  }

  return { startTextInput, commitText };
}