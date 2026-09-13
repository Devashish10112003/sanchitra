import { getRoughCanvas } from "./rough";
import { roundedRectPath } from "./path";

function hashUser(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function colorForUser(userId: string): { fill: string; stroke: string } {
  const hue = hashUser(userId) % 360;
  return {
    fill: `hsl(${hue}, 90%, 85%)`,
    stroke: `hsl(${hue}, 65%, 40%)`,
  };
}

const POINTER_PATH: Array<[number, number]> = [
  [0, 0],
  [0, 15.5],
  [4, 12],
  [6.5, 18],
  [8.7, 17.1],
  [6.3, 11.1],
  [11.5, 11.1],
];

export function drawRemoteCursor(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  userId: string,
  username: string,
  scale: number
) {
  const rc = getRoughCanvas(canvas);
  const { fill, stroke } = colorForUser(userId);
  const seed = hashUser(userId) % 2 ** 31;

  const points: Array<[number, number]> = POINTER_PATH.map(([px, py]) => [
    x + px * scale,
    y + py * scale,
  ]);

  rc.polygon(points, {
    fill,
    fillStyle: "solid",
    stroke,
    strokeWidth: 1.5 * scale,
    roughness: 1.6,
    bowing: 1,
    seed,
  });

  ctx.save();
  ctx.font = `${16 * scale}px "Caveat", cursive`;
  const textWidth = ctx.measureText(username).width;
  const paddingX = 10 * scale;
  const boxWidth = textWidth + paddingX * 2;
  const boxHeight = 24 * scale;
  const boxX = x + 10 * scale;
  const boxY = y + 14 * scale;
  const radius = 8 * scale;

  const path = roundedRectPath(boxX, boxY, boxWidth, boxHeight, radius);
  rc.path(path, {
    fill,
    fillStyle: "solid",
    stroke,
    strokeWidth: 1.5 * scale,
    roughness: 1.4,
    seed: seed + 1,
  });

  ctx.fillStyle = "#2b2b2b";
  ctx.textBaseline = "middle";
  ctx.fillText(username, boxX + paddingX, boxY + boxHeight / 2 + scale);
  ctx.restore();
}
