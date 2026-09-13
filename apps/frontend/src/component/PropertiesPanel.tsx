import type { ElementTypeSchema } from "@repo/schemas/types";
import {
  BACKGROUND_COLORS,
  STROKE_COLORS,
  STROKE_WIDTHS,
  TRANSPARENT,
  type ElementStyle,
} from "../canvas/style";

type PropertiesPanelProps = {
  tool: ElementTypeSchema;
  style: ElementStyle;
  onChange: (patch: Partial<ElementStyle>) => void;
};

const HIDDEN_TOOLS: ElementTypeSchema[] = ["hand", "eraser"];
const NO_BACKGROUND_TOOLS: ElementTypeSchema[] = ["line", "arrow", "freehand", "text"];
const EDGE_TOOLS: ElementTypeSchema[] = ["rect", "diamond"];

const SWATCH_BASE =
  "h-7 w-7 rounded-lg border transition-transform hover:scale-105";
const ACTIVE_RING = "ring-2 ring-[#6965db] ring-offset-1";

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[#6b6b6b]">{label}</span>
      {children}
    </div>
  );
}

function ColorRow({
  colors,
  value,
  onPick,
  allowTransparent,
}: {
  colors: string[];
  value: string;
  onPick: (color: string) => void;
  allowTransparent?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {colors.map((color) => {
        const isActive = value === color;
        const isTransparent = color === TRANSPARENT;
        return (
          <button
            key={color}
            type="button"
            title={isTransparent ? "Transparent" : color}
            onClick={() => onPick(color)}
            className={`${SWATCH_BASE} ${isActive ? ACTIVE_RING : "border-[#e0dfff]"}`}
            style={
              isTransparent
                ? {
                    backgroundImage:
                      "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                    backgroundSize: "8px 8px",
                    backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0",
                  }
                : { backgroundColor: color }
            }
          />
        );
      })}
      <label
        className={`${SWATCH_BASE} relative cursor-pointer overflow-hidden border-[#e0dfff]`}
        title="Custom color"
        style={{ backgroundColor: allowTransparent && value === TRANSPARENT ? "#fff" : value }}
      >
        <input
          type="color"
          value={value === TRANSPARENT ? "#ffffff" : value}
          onChange={(e) => onPick(e.target.value)}
          className="absolute -left-1 -top-1 h-9 w-9 cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}

function OptionButton({
  isActive,
  title,
  onClick,
  children,
}: {
  isActive: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-8 w-9 items-center justify-center rounded-lg border transition-colors ${
        isActive
          ? "border-[#6965db] bg-[#eeedfb] text-[#6965db]"
          : "border-[#e0dfff] text-[#1e1e1e] hover:bg-[#f5f5f9]"
      }`}
    >
      {children}
    </button>
  );
}

export function PropertiesPanel({ tool, style, onChange }: PropertiesPanelProps) {
  if (HIDDEN_TOOLS.includes(tool)) return null;

  const isText = tool === "text";
  const showBackground = !NO_BACKGROUND_TOOLS.includes(tool);
  const showEdges = EDGE_TOOLS.includes(tool);

  return (
    <div className="absolute left-4 top-20 z-20 flex w-[196px] flex-col gap-4 rounded-2xl border border-[#e0dfff] bg-white p-3 shadow-[0_4px_16px_rgba(105,101,219,0.18)]">
      <Section label="Stroke">
        <ColorRow colors={STROKE_COLORS} value={style.strokeColor} onPick={(c) => onChange({ strokeColor: c })} />
      </Section>

      {showBackground && (
        <Section label="Background">
          <ColorRow
            colors={BACKGROUND_COLORS}
            value={style.backgroundColor}
            onPick={(c) => onChange({ backgroundColor: c })}
            allowTransparent
          />
        </Section>
      )}

      {!isText && (
        <>
          <Section label="Stroke width">
            <div className="flex items-center gap-1.5">
              {(
                [
                  ["thin", 1.5],
                  ["bold", 2.5],
                  ["extraBold", 4],
                ] as const
              ).map(([key, thickness]) => (
                <OptionButton
                  key={key}
                  title={key}
                  isActive={style.strokeWidth === STROKE_WIDTHS[key]}
                  onClick={() => onChange({ strokeWidth: STROKE_WIDTHS[key] })}
                >
                  <svg width="18" height="12" viewBox="0 0 18 12">
                    <line x1="1" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth={thickness} strokeLinecap="round" />
                  </svg>
                </OptionButton>
              ))}
            </div>
          </Section>

          <Section label="Stroke style">
            <div className="flex items-center gap-1.5">
              {(["solid", "dashed", "dotted"] as const).map((key) => (
                <OptionButton
                  key={key}
                  title={key}
                  isActive={style.strokeStyle === key}
                  onClick={() => onChange({ strokeStyle: key })}
                >
                  <svg width="18" height="12" viewBox="0 0 18 12">
                    <line
                      x1="1"
                      y1="6"
                      x2="17"
                      y2="6"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeDasharray={key === "solid" ? undefined : key === "dashed" ? "4 3" : "0.5 3.5"}
                    />
                  </svg>
                </OptionButton>
              ))}
            </div>
          </Section>

          <Section label="Sloppiness">
            <div className="flex items-center gap-1.5">
              {(
                [
                  ["architect", "M1 6 L17 6"],
                  ["artist", "M1 7 Q5 3 9 7 T17 7"],
                  ["cartoonist", "M1 8 Q4 1 8 8 T16 6 T18 9"],
                ] as const
              ).map(([key, path]) => (
                <OptionButton
                  key={key}
                  title={key}
                  isActive={style.sloppiness === key}
                  onClick={() => onChange({ sloppiness: key })}
                >
                  <svg width="18" height="12" viewBox="0 0 18 12">
                    <path d={path} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                  </svg>
                </OptionButton>
              ))}
            </div>
          </Section>
        </>
      )}

      {showEdges && (
        <Section label="Edges">
          <div className="flex items-center gap-1.5">
            <OptionButton title="Sharp" isActive={style.edges === "sharp"} onClick={() => onChange({ edges: "sharp" })}>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M2 10 L2 2 L10 2" fill="none" stroke="currentColor" strokeWidth={1.5} strokeDasharray="2 1.5" />
              </svg>
            </OptionButton>
            <OptionButton title="Round" isActive={style.edges === "round"} onClick={() => onChange({ edges: "round" })}>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M2 10 L2 6 Q2 2 6 2 L10 2" fill="none" stroke="currentColor" strokeWidth={1.5} strokeDasharray="2 1.5" />
              </svg>
            </OptionButton>
          </div>
        </Section>
      )}

      <Section label="Opacity">
        <input
          type="range"
          min={0}
          max={100}
          step={10}
          value={style.opacity}
          onChange={(e) => onChange({ opacity: Number(e.target.value) })}
          className="w-full accent-[#6965db]"
        />
        <div className="flex justify-between text-[10px] text-[#6b6b6b]">
          <span>0</span>
          <span>100</span>
        </div>
      </Section>
    </div>
  );
}
