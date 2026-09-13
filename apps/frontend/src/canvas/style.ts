import type { Options } from "roughjs/bin/core";
import type {
  DrawingElementSchema,
  EdgesSchema,
  SloppinessSchema,
  StrokeStyleSchema,
} from "@repo/schemas/types";

export type ElementStyle = {
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyleSchema;
  sloppiness: SloppinessSchema;
  edges: EdgesSchema;
  opacity: number;
};

export const TRANSPARENT = "transparent";

export const STROKE_COLORS = ["#1e1e1e", "#e03131", "#2f9e44", "#1971c2", "#f08c00"];
export const BACKGROUND_COLORS = [TRANSPARENT, "#802b2b", "#173a1e", "#0e3a5f", "#2e2410"];

export const STROKE_WIDTHS = {
  thin: 1,
  bold: 2,
  extraBold: 4,
} as const;

export const SLOPPINESS_VALUES: Record<SloppinessSchema, number> = {
  architect: 0.4,
  artist: 1.2,
  cartoonist: 2.8,
};

export const DEFAULT_STYLE: ElementStyle = {
  strokeColor: STROKE_COLORS[0],
  backgroundColor: BACKGROUND_COLORS[0],
  strokeWidth: STROKE_WIDTHS.bold,
  strokeStyle: "solid",
  sloppiness: "artist",
  edges: "sharp",
  opacity: 100,
};

function hashSeed(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % 2 ** 31;
}

export function roughOptionsFor(el: DrawingElementSchema): Options {
  const strokeColor = el.strokeColor ?? DEFAULT_STYLE.strokeColor;
  const backgroundColor = el.backgroundColor ?? DEFAULT_STYLE.backgroundColor;
  const strokeWidth = el.strokeWidth ?? DEFAULT_STYLE.strokeWidth;
  const strokeStyle = el.strokeStyle ?? DEFAULT_STYLE.strokeStyle;
  const sloppiness = el.sloppiness ?? DEFAULT_STYLE.sloppiness;

  const options: Options = {
    stroke: strokeColor,
    strokeWidth,
    roughness: SLOPPINESS_VALUES[sloppiness],
    seed: hashSeed(el.id),
  };

  if (backgroundColor !== TRANSPARENT) {
    options.fill = backgroundColor;
    options.fillStyle = "solid";
  }

  if (strokeStyle === "dashed") options.strokeLineDash = [12, 8];
  if (strokeStyle === "dotted") options.strokeLineDash = [2, 6];

  return options;
}

export function opacityFor(el: DrawingElementSchema): number {
  return (el.opacity ?? DEFAULT_STYLE.opacity) / 100;
}
