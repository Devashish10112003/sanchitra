import { useRef } from "react";
import type { DrawingElement } from "./types/canvas";

export function useHistory(elementsRef: React.RefObject<DrawingElement[]>) {
  const past = useRef<DrawingElement[][]>([]);
  const future = useRef<DrawingElement[][]>([]);

  function snapshot() {
    // deep clone (important!)
    past.current.push(structuredClone(elementsRef.current));
    future.current = [];
  }

  function undo() {
    if (past.current.length === 0) return;

    future.current.push(structuredClone(elementsRef.current));
    elementsRef.current = past.current.pop()!;
  }

  function redo() {
    if (future.current.length === 0) return;

    past.current.push(structuredClone(elementsRef.current));
    elementsRef.current = future.current.pop()!;
  }

  function clear() {
    past.current = [];
    future.current = [];
  }

  return { snapshot, undo, redo, clear };
}
