export type Pt = { x: number; y: number };

/** Smooth a control polygon into a dense point list using Catmull-Rom splines. */
export function catmullRom(points: Pt[], samples = 22): Pt[] {
  if (points.length < 2) return points.slice();
  const pts = [points[0], ...points, points[points.length - 1]];
  const out: Pt[] = [];
  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2];
    for (let j = 0; j < samples; j++) {
      const t = j / samples;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push({
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y:
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  out.push(pts[pts.length - 2]);
  return out;
}

export function toPath(points: Pt[], close = false): string {
  if (!points.length) return "";
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`;
  }
  return close ? `${d} Z` : d;
}

export function cumulativeLengths(points: Pt[]): number[] {
  const cum: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    cum.push(cum[i - 1] + Math.hypot(dx, dy));
  }
  return cum;
}

export type Sample = { x: number; y: number; angle: number };

/** Point + heading at a given arc-length along a dense polyline. */
export function pointAt(points: Pt[], cum: number[], dist: number): Sample {
  const total = cum[cum.length - 1];
  const d = Math.max(0, Math.min(total, dist));
  let lo = 0;
  let hi = cum.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= d) lo = mid;
    else hi = mid;
  }
  const segLen = cum[hi] - cum[lo] || 1;
  const t = (d - cum[lo]) / segLen;
  const a = points[lo];
  const b = points[hi];
  const angle = Math.atan2(b.y - a.y, b.x - a.x);
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    angle,
  };
}

/** Offset a point sideways from the path heading. */
export function offsetPoint(s: Sample, side: number, amount: number): Pt {
  const nx = Math.sin(s.angle) * side;
  const ny = -Math.cos(s.angle) * side;
  return { x: s.x + nx * amount, y: s.y + ny * amount };
}
