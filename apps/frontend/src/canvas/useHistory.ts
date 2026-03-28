import { useRef } from "react";
import type { DrawingElementSchema } from "@repo/schemas/types";

export function useHistory(elementsRef: React.RefObject<DrawingElementSchema[]>) {
  const past = useRef<DrawingElementSchema[][]>([]);
  const future = useRef<DrawingElementSchema[][]>([]);

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
