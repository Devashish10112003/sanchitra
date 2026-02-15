import { useEffect } from "react";

export function useCanvasSetup(canvasRef:React.RefObject<HTMLCanvasElement|null>,ctxRef:React.RefObject<CanvasRenderingContext2D|null>,dprRef:React.MutableRefObject<number>){
useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctxRef.current = ctx;
  }, []);
}