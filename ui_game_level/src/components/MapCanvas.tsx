import { useMemo } from "react";
import {
  MAP_H,
  MAP_W,
  centerPath,
  flowPath,
  levels,
  totalLength,
} from "../lib/map";
import { offsetPoint, pointAt } from "../lib/curve";
import { centerCum, centerline } from "../lib/map";

const RIVER_W = 190;

export default function MapCanvas() {
  const sparkles = useMemo(() => {
    const out: { x: number; y: number; s: number; d: number }[] = [];
    for (let i = 0; i < 90; i++) {
      const len = (i / 90) * (totalLength - 200) + 120;
      const p = pointAt(centerline, centerCum, len);
      const side = i % 2 === 0 ? 1 : -1;
      const off = 20 + ((i * 37) % 70);
      const q = offsetPoint(p, side, off);
      out.push({ x: q.x, y: q.y, s: 0.5 + ((i * 13) % 7) / 10, d: (i % 9) * 0.4 });
    }
    return out;
  }, []);

  const ripples = useMemo(() => {
    const out: { x: number; y: number; d: number }[] = [];
    for (let i = 0; i < 22; i++) {
      const len = (i / 22) * (totalLength - 300) + 200;
      const p = pointAt(centerline, centerCum, len);
      const q = offsetPoint(p, i % 2 ? 1 : -1, 55);
      out.push({ x: q.x, y: q.y, d: (i % 6) * 0.6 });
    }
    return out;
  }, []);

  return (
    <svg
      width={MAP_W}
      height={MAP_H}
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className="absolute left-0 top-0 z-20"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <linearGradient id="riverGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#43d0a1" />
          <stop offset="45%" stopColor="#1fb088" />
          <stop offset="100%" stopColor="#127f5e" />
        </linearGradient>
        <linearGradient id="bankGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdf6dd" />
          <stop offset="100%" stopColor="#e6f3c4" />
        </linearGradient>
        <linearGradient id="ribbonA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8ee06a" />
          <stop offset="100%" stopColor="#4caf3c" />
        </linearGradient>
        <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ---------- river ---------- */}
      <path d={centerPath} stroke="url(#bankGrad)" strokeWidth={RIVER_W + 26} fill="none" strokeLinecap="round" opacity="0.82" />
      <path d={centerPath} stroke="#7fe0bd" strokeWidth={RIVER_W + 6} fill="none" strokeLinecap="round" opacity="0.95" />
      <path d={centerPath} stroke="url(#riverGrad)" strokeWidth={RIVER_W} fill="none" strokeLinecap="round" />

      {/* ---------- finish gate ---------- */}
      <FinishGate />
    </svg>
  );
}

function FinishGate() {
  const last = levels[levels.length - 1];
  const y = last.pad.y + 210;
  return (
    <g transform={`translate(0 ${y})`}>
      <ellipse cx="215" cy="40" rx="150" ry="46" fill="#0f172a" opacity="0.12" />
      <rect x="60" y="0" width="310" height="76" rx="38" fill="#f7c948" stroke="#c99414" strokeWidth="5" />
      <rect x="72" y="12" width="286" height="52" rx="28" fill="#ffe08a" />
      <text
        x="215"
        y="49"
        textAnchor="middle"
        fontSize="30"
        fontWeight="800"
        fill="#8a5a00"
        style={{ letterSpacing: 1 }}
      >
        CHƯƠNG MỚI SẮP TỚI 🎉
      </text>
    </g>
  );
}
