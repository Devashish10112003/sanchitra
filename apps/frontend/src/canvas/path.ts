export function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const radius = Math.min(r, w / 2, h / 2);
  return `M ${x + radius} ${y}
    L ${x + w - radius} ${y}
    Q ${x + w} ${y} ${x + w} ${y + radius}
    L ${x + w} ${y + h - radius}
    Q ${x + w} ${y + h} ${x + w - radius} ${y + h}
    L ${x + radius} ${y + h}
    Q ${x} ${y + h} ${x} ${y + h - radius}
    L ${x} ${y + radius}
    Q ${x} ${y} ${x + radius} ${y}
    Z`;
}

function distance(a: [number, number], b: [number, number]): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

function pointTowards(from: [number, number], to: [number, number], d: number): [number, number] {
  const len = distance(from, to);
  if (len === 0) return from;
  const t = Math.min(d, len) / len;
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
}

export function roundedPolygonPath(points: [number, number][], radius: number): string {
  const n = points.length;
  if (radius <= 0 || n < 3) {
    return points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ") + " Z";
  }

  let d = "";
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];

    const r = Math.min(radius, distance(curr, prev) / 2, distance(curr, next) / 2);
    const start = pointTowards(curr, prev, r);
    const end = pointTowards(curr, next, r);

    d += i === 0 ? `M ${start[0]} ${start[1]} ` : `L ${start[0]} ${start[1]} `;
    d += `Q ${curr[0]} ${curr[1]} ${end[0]} ${end[1]} `;
  }
  return d + "Z";
}
