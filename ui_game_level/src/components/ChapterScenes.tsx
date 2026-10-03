import type { ReactNode } from "react";
import { bankX, type Chapter } from "../lib/map";

/* ================================================================== */
/*  Chapter scenes v2 – everything hugs the winding river banks        */
/*  (chapters 4 → 10, from Phố Cổ Hội An downwards)                    */
/* ================================================================== */

type SceneProps = { chapter: Chapter };

const DEG = 180 / Math.PI;

/* ------------------------------ helpers ------------------------------ */

function hash(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function range(i: number, salt: number, min: number, max: number): number {
  return min + hash(i, salt) * (max - min);
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** Local tilt of the bank line at a global y (degrees). */
function bankAngle(chapter: Chapter, y: number, side: 1 | -1, dist: number): number {
  const a = bankX(y - 12, side, dist);
  const b = bankX(y + 12, side, dist);
  return clamp(Math.atan2(24, b - a) * DEG, -18, 18);
}

/** A polyline following one bank (local coordinates). */
function bankPath(chapter: Chapter, side: 1 | -1, dist: number, step = 16): string {
  const { top, height } = chapter;
  let d = "";
  for (let y = top; y <= top + height; y += step) {
    d += `${d ? "L" : "M"}${bankX(y, side, dist).toFixed(1)} ${(y - top).toFixed(1)} `;
  }
  return d;
}

/** Places elements at regular steps along BOTH banks, following the river. */
function BankItems({
  chapter,
  step = 60,
  salt = 0,
  dist,
  from = 26,
  render,
}: {
  chapter: Chapter;
  step?: number;
  salt?: number;
  dist: number | ((i: number, side: 1 | -1) => number);
  from?: number;
  render: (i: number, side: 1 | -1, x: number, y: number, a: number, v: number) => ReactNode;
}) {
  const els: ReactNode[] = [];
  const { top, height } = chapter;
  let i = 0;
  for (let y = top + from; y <= top + height - 84; y += step) {
    for (const side of [1, -1] as const) {
      const d = typeof dist === "number" ? dist : dist(i, side);
      const x = bankX(y, side, d);
      const a = bankAngle(chapter, y, side, d);
      const v = hash(i, salt + side * 13.7);
      els.push(
        <g key={`${side}-${i}`} transform={`translate(${x.toFixed(1)} ${(y - top).toFixed(1)}) rotate(${a.toFixed(1)})`}>
          {render(i, side, x, y - top, a, v)}
        </g>
      );
    }
    i++;
  }
  return <>{els}</>;
}

/** A filled silhouette band hugging one bank (distant town / hills). */
function SilhouetteBank({
  chapter,
  side,
  dist,
  color,
  opacity = 1,
  spike = 0,
  amp = 8,
  freq = 0.016,
  from = 0,
}: {
  chapter: Chapter;
  side: 1 | -1;
  dist: number;
  color: string;
  opacity?: number;
  spike?: number; // spacing of roof-spikes along the edge (0 = none)
  amp?: number;
  freq?: number;
  from?: number;
}) {
  const { top, height } = chapter;
  const pts: { x: number; y: number }[] = [];
  for (let y = top + from; y <= top + height; y += 16) {
    pts.push({ x: bankX(y, side, dist + Math.sin(y * freq + side * 4) * amp), y: y - top });
  }
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const edgeX = side === -1 ? 0 : 430;
  const last = pts[pts.length - 1];
  const path = `${d} L${edgeX} ${last.y.toFixed(1)} L${edgeX} ${pts[0].y.toFixed(1)} Z`;
  const spikes: ReactNode[] = [];
  if (spike > 0) {
    for (let y = top + from + 18; y <= top + height - 40; y += spike) {
      const x = bankX(y, side, dist + Math.sin(y * freq + side * 4) * amp);
      const j = hash(Math.round(y / spike), side * 3 + dist);
      const hgt = 9 + j * 20;
      const dir = side === -1 ? 1 : -1;
      spikes.push(
        <path
          key={y}
          d={`M${x.toFixed(1)} ${(y - top).toFixed(1)} L${(x + dir * 16).toFixed(1)} ${(y - top - hgt * 0.4).toFixed(1)} L${(x + dir * 30).toFixed(1)} ${(y - top).toFixed(1)} Z`}
        />
      );
    }
  }
  return (
    <g opacity={opacity}>
      <path d={path} fill={color} />
      {spikes}
    </g>
  );
}

/** A band between two offsets from the river centre (wall / sand bank). */
function RibbonBank({
  chapter,
  side,
  d1,
  d2,
  fill,
  edge,
  merlon = 0,
}: {
  chapter: Chapter;
  side: 1 | -1;
  d1: number;
  d2: number;
  fill: string;
  edge: string;
  merlon?: number; // spacing of merlon blocks along the outer edge (0 = none)
}) {
  const { top, height } = chapter;
  const outer: string[] = [];
  const inner: string[] = [];
  for (let y = top; y <= top + height; y += 16) {
    outer.push(`${bankX(y, side, d2).toFixed(1)} ${(y - top).toFixed(1)}`);
    inner.push(`${bankX(y, side, d1).toFixed(1)} ${(y - top).toFixed(1)}`);
  }
  const d = `M${outer.join(" L")} L${inner.reverse().join(" L")} Z`;
  const merlons: ReactNode[] = [];
  if (merlon > 0) {
    for (let y = top + 8; y <= top + height - 30; y += merlon) {
      const x = bankX(y, side, d2);
      merlons.push(<rect key={y} x={x - 6} y={y - top - 9} width="12" height="9" fill={fill} stroke={edge} strokeWidth="1.4" />);
    }
  }
  return (
    <g>
      <path d={d} fill={fill} stroke={edge} strokeWidth="2" />
      {merlons}
    </g>
  );
}

function MistBand({ y, id, h = 26 }: { y: number; id: string; h?: number }) {
  return <rect x="0" y={y} width="430" height={h} fill={`url(#${id})`} />;
}

/* ------------------------------ motifs ------------------------------- */

function OldHouse({
  x,
  y,
  w,
  wall = "#f4d878",
  roof = "#a34a26",
  shutter = "#7a4a2b",
  tilesId,
  seed = 0,
  bloom = "#ff6f9c",
}: {
  x: number;
  y: number;
  w: number;
  wall?: string;
  roof?: string;
  shutter?: string;
  tilesId: string;
  seed?: number;
  bloom?: string;
}) {
  const hgt = 148 + (seed % 3) * 20;
  const roofH = 46 + (seed % 2) * 12;
  const win = w * 0.3;
  return (
    <g>
      <rect x={x} y={y} width={w} height={hgt} fill={wall} stroke="#8a5a2b" strokeWidth="2" />
      <rect x={x + 6} y={y + 8} width={w - 12} height={hgt - 16} fill="#ffffff" opacity="0.1" />
      {[0.14, 0.58].map((f, i) => (
        <g key={i}>
          <rect x={x + w * f} y={y + 14} width={win} height="24" fill={shutter} stroke="#5f3d1f" strokeWidth="2" />
          <path
            d={`M${x + w * f} ${y + 20} h${win} M${x + w * f} ${y + 26} h${win} M${x + w * f} ${y + 32} h${win}`}
            stroke="#5f3d1f"
            strokeWidth="1.6"
          />
          <rect x={x + w * f - 3} y={y + 43} width={win + 6} height="7" rx="2" fill="#8a5a33" />
          <circle cx={x + w * f + win * 0.2} cy={y + 40} r="4" fill={bloom} />
          <circle cx={x + w * f + win * 0.8} cy={y + 40} r="4" fill="#ff8fb3" />
        </g>
      ))}
      <rect x={x} y={y + hgt * 0.58} width={w} height="9" fill="#a9713d" />
      <rect x={x + w * 0.16} y={y + hgt * 0.7} width={w * 0.68} height={hgt * 0.22} fill={shutter} stroke="#5f3d1f" strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${x + w * 0.16} ${y + hgt * 0.7 + 7 + i * 8} h${w * 0.68}`} stroke="#5f3d1f" strokeWidth="1.5" />
      ))}
      <path
        d={`M${x - 9} ${y} L${x + w / 2} ${y - roofH} L${x + w + 9} ${y} Z`}
        fill={roof}
        stroke="#7d3420"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d={`M${x - 9} ${y} L${x + w / 2} ${y - roofH} L${x + w + 9} ${y} Z`} fill={`url(#${tilesId})`} />
      <path d={`M${x - 9} ${y} q -8 -3 -5 -13`} stroke="#7d3420" strokeWidth="2.5" fill="none" />
      <path d={`M${x + w + 9} ${y} q 8 -3 5 -13`} stroke="#7d3420" strokeWidth="2.5" fill="none" />
      <rect x={x - 11} y={y - 3} width={w + 22} height="6" rx="3" fill="#7d3420" />
      {[0.3, 0.72].map((f, i) => (
        <g key={i} transform={`translate(${x + w * f} ${y - 2})`}>
          <circle r="8" fill="#ffb84d" opacity="0.25" />
          <rect x="-3" y="0" width="6" height="4" rx="1.6" fill="#b8322c" />
          <ellipse cy="8" rx="4.4" ry="5.6" fill="#f4842f" />
          <path d="M0 13.6 l0 6" stroke="#e0b552" strokeWidth="1.5" />
        </g>
      ))}
      {seed % 2 === 0 && (
        <g transform={`translate(${x + w * 0.9} ${y - 6})`}>
          <circle r="9" fill={bloom} opacity="0.9" />
          <circle cx="-7" cy="4" r="7" fill="#ff8fb3" opacity="0.9" />
          <circle cx="7" cy="4" r="7" fill="#e85a8a" opacity="0.9" />
          <circle cy="8" r="6" fill="#ffa3c4" opacity="0.9" />
        </g>
      )}
    </g>
  );
}

function LampPost({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-3" y="0" width="6" height="78" rx="3" fill="#6f4a26" />
      <rect x="-9" y="76" width="18" height="5" rx="2" fill="#6f4a26" />
      <path d="M3 2 Q18 -4 18 -12" stroke="#6f4a26" strokeWidth="4" fill="none" />
      <g transform="translate(18 -8)">
        <circle r="9" fill="#ffb84d" opacity="0.25" />
        <rect x="-3.2" y="-8" width="6.4" height="4" rx="1.6" fill="#b8322c" />
        <ellipse cy="1" rx="4.6" ry="6" fill="#f4842f" />
        <path d="M0 7 l0 6 M-3 7 l-2 4 M3 7 l2 4" stroke="#e0b552" strokeWidth="1.6" fill="none" />
      </g>
    </g>
  );
}

function Pine({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <rect x="-3" y="-14" width="6" height="26" fill="#7a4a2b" />
      <path d="M0 -52 L-16 -20 L16 -20 Z" fill="#2f6b42" />
      <path d="M0 -40 L-19 -4 L19 -4 Z" fill="#3f8f5c" />
      <path d="M0 -27 L-22 14 L22 14 Z" fill="#2f6b42" />
      <ellipse cy="16" rx="14" ry="4" fill="rgba(0,0,0,0.12)" />
    </g>
  );
}

function Palm({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx="2" cy="2" rx="16" ry="4" fill="rgba(0,0,0,0.14)" />
      <path d="M0 0 Q6 -40 -2 -78" stroke="#9a6a3f" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M0 0 Q10 -30 2 -70" stroke="#b07d49" strokeWidth="3" fill="none" />
      <path d="M-2 -78 Q-46 -96 -58 -70 Q-36 -74 -12 -66 Z" fill="#2f8f4e" />
      <path d="M-2 -78 Q-42 -66 -50 -40 Q-28 -50 -8 -56 Z" fill="#3f9c5c" />
      <path d="M-2 -78 Q-12 -108 6 -114 Q2 -86 8 -64 Z" fill="#35854a" />
      <path d="M-2 -78 Q28 -108 44 -96 Q28 -80 16 -62 Z" fill="#2f8f4e" />
      <path d="M-2 -78 Q42 -60 54 -36 Q30 -48 10 -54 Z" fill="#3f9c5c" />
      <circle cx="-4" cy="-76" r="6" fill="#7d4f27" />
      <circle cx="6" cy="-74" r="6" fill="#8a5a33" />
    </g>
  );
}

function Karst({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <path
        d="M-78 0 C-78 -130 -52 -190 -20 -196 C4 -200 22 -186 36 -166 C58 -136 62 -70 62 0 Z"
        fill="#5d8f6e"
        stroke="#3f6a50"
        strokeWidth="3"
      />
      <path d="M-46 -140 C-20 -176 2 -180 20 -166 C6 -152 -14 -144 -30 -122 Z" fill="#7fb78e" opacity="0.7" />
      <circle cx="-20" cy="-192" r="14" fill="#3f8f5c" />
      <circle cx="8" cy="-178" r="11" fill="#4a9c66" />
      <ellipse cx="0" cy="3" rx="42" ry="5" fill="rgba(0,0,0,0.12)" />
    </g>
  );
}

function Stork({ s = 1, flip = false }: { s?: number; flip?: boolean }) {
  return (
    <g transform={`scale(${flip ? -s : s} ${s})`}>
      <path d="M0 0 Q-6 -10 2 -16 Q8 -22 18 -18 Q12 -12 8 -6 Q2 0 0 0 Z" fill="#ffffff" stroke="#cfd8dc" strokeWidth="1.5" />
      <path d="M18 -18 Q26 -30 34 -26" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M34 -26 L44 -29 L34 -24 Z" fill="#e0763f" />
      <path d="M4 0 L4 12 M6 0 L6 12" stroke="#8d9aa2" strokeWidth="1.6" />
    </g>
  );
}

function Terraces({ s = 1, flip = false }: { s?: number; flip?: boolean }) {
  const bands = ["#8cc165", "#a6cf5a", "#d9c65c", "#79b95a"];
  const w = 112;
  return (
    <g transform={`scale(${flip ? -s : s} ${s})`}>
      {bands.map((c, i) => (
        <path
          key={i}
          d={`M0 ${i * 18} Q ${w / 2} ${i * 18 + 12} ${w} ${i * 18} L${w} ${i * 18 + 20} L0 ${i * 18 + 20} Z`}
          fill={c}
          stroke="#5f8a42"
          strokeWidth="1.5"
        />
      ))}
    </g>
  );
}

function Hut({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <rect x="-4" y="10" width="6" height="26" fill="#7a4a2b" />
      <rect x="10" y="10" width="6" height="26" fill="#7a4a2b" />
      <rect x="-12" y="2" width="34" height="12" fill="#8a5a33" />
      <path d="M-18 2 L0 -22 L18 2 Z" fill="#d8b25e" stroke="#a97932" strokeWidth="2.5" />
      <rect x="-4" y="0" width="9" height="14" fill="#5f3d1f" />
    </g>
  );
}

function Longhouse({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx="0" cy="62" rx="46" ry="5" fill="rgba(0,0,0,0.14)" />
      <rect x="-40" y="34" width="8" height="28" fill="#6f4a26" />
      <rect x="-12" y="34" width="8" height="28" fill="#6f4a26" />
      <rect x="32" y="34" width="8" height="28" fill="#6f4a26" />
      <rect x="-46" y="24" width="92" height="12" fill="#8a5a33" />
      <path d="M-40 24 L40 24 L34 -10 Q0 -24 -34 -10 Z" fill="#9c6b45" stroke="#5f3d1f" strokeWidth="2.5" />
      <path d="M-54 -10 Q0 -58 54 -10 L48 -18 Q0 -66 -48 -18 Z" fill="#d8b25e" stroke="#a97932" strokeWidth="2.5" />
      <path d="M-40 -26 Q0 -46 40 -26" stroke="#a97932" strokeWidth="2" fill="none" />
      <rect x="-9" y="0" width="18" height="24" rx="8" fill="#5f3d1f" />
      <path d="M28 62 L38 34 M32 64 L42 36" stroke="#7a4a2b" strokeWidth="3" />
      <path d="M28 54 L36 48 M31 58 L39 52" stroke="#7a4a2b" strokeWidth="2.4" />
    </g>
  );
}

function CoffeeBush({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx="-8" cy="0" rx="14" ry="10" fill="#3f8f5c" />
      <ellipse cx="8" cy="2" rx="12" ry="9" fill="#35854a" />
      <circle cx="-8" cy="-4" r="1.8" fill="#d9483b" />
      <circle cx="6" cy="-2" r="1.8" fill="#d9483b" />
      <circle cx="1" cy="-6" r="1.8" fill="#e05a45" />
    </g>
  );
}

function Sailboat({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <path d="M-14 0 h28 l-6 8 h-16 Z" fill="#7a4a2b" />
      <path d="M0 -2 V-26 L16 -2 Z" fill="#ffffff" opacity="0.9" />
      <path d="M-2 -2 V-18 L-14 -2 Z" fill="#ffffff" opacity="0.75" />
    </g>
  );
}

function Starfish({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <path
        d="M0 -12 L4 -4 L12 -4 L6 2 L8 10 L0 5 L-8 10 L-6 2 L-12 -4 L-4 -4 Z"
        fill="#f2856c"
        stroke="#c95a42"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </g>
  );
}

function LotusFlower({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <path d="M0 0 q-7 -2 -6 -9 q6 2 6 9" fill="#ffb3d1" />
      <path d="M0 0 q7 -2 6 -9 q-6 2 -6 9" fill="#ff9ec4" />
      <path d="M0 0 q-2.5 -7 0 -11 q2.5 4 0 11" fill="#ffd0e2" />
    </g>
  );
}

function Banyan({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <path d="M0 0 C6 -30 2 -54 -2 -70" stroke="#8a5a33" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M-2 -40 q-14 -4 -18 -20 M0 -52 q12 -6 16 -20" stroke="#8a5a33" strokeWidth="3" fill="none" />
      <circle cx="-26" cy="-84" r="26" fill="#4a9c5c" />
      <circle cx="6" cy="-92" r="24" fill="#3f8f5c" />
      <circle cx="30" cy="-78" r="22" fill="#4a9c5c" />
      <circle cx="-12" cy="-100" r="20" fill="#57ab68" />
      <circle cx="18" cy="-100" r="16" fill="#5cb470" />
      <ellipse cx="0" cy="2" rx="18" ry="4" fill="rgba(0,0,0,0.12)" />
    </g>
  );
}

function TurtleTower({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx="0" cy="0" rx="36" ry="8" fill="#3f8f5c" />
      <ellipse cx="0" cy="-2" rx="26" ry="6" fill="#4a9c5c" />
      <rect x="-13" y="-30" width="26" height="30" fill="#c9b28a" stroke="#8a6d3f" strokeWidth="2" />
      <rect x="-9" y="-24" width="9" height="18" rx="4" fill="#8a6d3f" opacity="0.85" />
      <path d="M-15 -30 Q0 -42 15 -30 Z" fill="#b84f2e" stroke="#7d3420" strokeWidth="2" />
      <rect x="-7" y="-46" width="14" height="16" fill="#c9b28a" stroke="#8a6d3f" strokeWidth="2" />
      <path d="M-9 -46 Q0 -56 9 -46 Z" fill="#b84f2e" stroke="#7d3420" strokeWidth="2" />
      <path d="M0 -56 V-66" stroke="#8a6d3f" strokeWidth="2" />
      <path d="M0 -66 l7 -2 v4 Z" fill="#c99414" />
    </g>
  );
}

function HueGate({ x, y, s = 1, id }: { x: number; y: number; s?: number; id: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="78" rx="60" ry="7" fill="rgba(0,0,0,0.14)" />
      <rect x="-62" y="0" width="124" height="74" fill="#b03232" stroke="#6e1f1f" strokeWidth="3" />
      <rect x="-62" y="0" width="124" height="10" fill="#8a2525" />
      {[-42, -21, 0, 21, 42].map((dx, i) => (
        <path
          key={i}
          d={`M${dx - 7} 74 V28 A7 7 0 0 1 ${dx + 7} 28 V74 Z`}
          fill={i === 2 ? "#6e1f1f" : "#7e2222"}
          stroke="#5e1a1a"
          strokeWidth="1.6"
        />
      ))}
      <path d="M-10 74 V18 A10 10 0 0 1 10 18 V74 Z" fill="#6e1f1f" />
      <path d="M-6 74 V20 A6 6 0 0 1 6 20 V74 Z" fill="#8a6d3f" opacity="0.55" />
      {[-52, -34, -16, 16, 34, 52].map((dx, i) => (
        <rect key={i} x={dx - 3} y="-14" width="6" height="20" fill="#8a2525" stroke="#5e1a1a" strokeWidth="1.5" />
      ))}
      <path d="M-72 4 Q0 -34 72 4 L66 -2 Q0 -40 -66 -2 Z" fill="#e3b23c" stroke="#a06d18" strokeWidth="2.5" />
      <path d="M-70 2 Q0 -30 70 2 L64 -4 Q0 -36 -64 -4 Z" fill={`url(#${id})`} />
      <path d="M-72 4 Q0 -34 72 4" fill="none" stroke="#c89b26" strokeWidth="2" />
      <path d="M-72 4 q-7 -2 -5 -12 M72 4 q7 -2 5 -12" stroke="#a06d18" strokeWidth="2.5" fill="none" />
      <g transform="translate(0 -34)">
        <line x1="0" y1="0" x2="0" y2="-24" stroke="#6e1f1f" strokeWidth="2.5" />
        <path d="M0 -24 L18 -19 L0 -14 Z" fill="#e8c22a" />
      </g>
      <ellipse cx="0" cy="84" rx="50" ry="10" fill="#4f9b5a" opacity="0.9" />
      <LotusFlower s={0.9} />
    </g>
  );
}

function Clouds({ ys, color }: { ys: number[]; color: string }) {
  return (
    <g fill={color}>
      {ys.map((y, i) => (
        <g key={i}>
          <ellipse cx={50 + ((i * 137) % 340)} cy={y} rx={54} ry={13} opacity="0.5" />
          <ellipse cx={140 + ((i * 211) % 220)} cy={y + 34} rx={40} ry={10} opacity="0.35" />
        </g>
      ))}
    </g>
  );
}

function GrassTuft({ s = 1, c = "#3f8f5c" }: { s?: number; c?: string }) {
  return (
    <g transform={`scale(${s})`} stroke={c} strokeWidth="2" fill="none" strokeLinecap="round">
      <path d="M-3 0 q-2 -8 -1 -13 M0 0 q0 -9 1 -14 M3 0 q3 -7 4 -11" />
    </g>
  );
}

function ReedTuft({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <path d="M-5 0 q-4 -18 0 -30 M0 0 q0 -20 2 -33 M5 0 q4 -16 6 -26" stroke="#4a9c5c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="0" cy="-32" rx="3" ry="7" fill="#8a5a33" />
    </g>
  );
}

function waveLine(y: number): string {
  let d = `M-20 ${y}`;
  for (let i = 0; i < 9; i++) d += ` q30 ${i % 2 ? 10 : -10} 60 0`;
  return d;
}

/* ------------------------------ Hội An ------------------------------ */

function HoiAnScene({ chapter }: SceneProps) {
  const { height: h, id } = chapter;
  const P = `scene-d-${id}`;
  return (
    <>
      <defs>
        <linearGradient id={`${P}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dcf5c4" />
          <stop offset="45%" stopColor="#9edb79" />
          <stop offset="100%" stopColor="#6cb652" />
        </linearGradient>
        <linearGradient id={`${P}-mist`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <pattern id={`${P}-tiles`} width="18" height="13" patternUnits="userSpaceOnUse">
          <path d="M0 7 q9 -9 18 0" fill="none" stroke="#7d3420" strokeWidth="1.8" />
        </pattern>
      </defs>

      <rect width="430" height={h} fill={`url(#${P}-sky)`} />

      {/* sun + clouds */}
      <circle cx="306" cy={h * 0.13} r="96" fill="#f2fbd4" opacity="0.3" />
      <circle cx="306" cy={h * 0.13} r="54" fill="#f8fce0" opacity="0.55" />
      <circle cx="306" cy={h * 0.13} r="26" fill="#fdfef2" />
      <ellipse cx="66" cy={h * 0.18} rx="52" ry="12" fill="#e8f6cc" opacity="0.6" />
      <ellipse cx="370" cy={h * 0.24} rx="62" ry="13" fill="#ddf2c0" opacity="0.55" />

      {/* distant old town hugging the river for the whole chapter */}
      <SilhouetteBank chapter={chapter} side={-1} dist={252} color="#7da45c" opacity={0.55} spike={54} from={h * 0.1} />
      <SilhouetteBank chapter={chapter} side={1} dist={252} color="#7da45c" opacity={0.55} spike={54} from={h * 0.1} />
      <SilhouetteBank chapter={chapter} side={-1} dist={202} color="#5f8a43" opacity={0.88} spike={44} from={h * 0.16} />
      <SilhouetteBank chapter={chapter} side={1} dist={202} color="#5f8a43" opacity={0.88} spike={44} from={h * 0.16} />

      {/* mid tree line following both banks */}
      <BankItems
        chapter={chapter}
        step={74}
        salt={5}
        dist={(i, s) => 176 + range(i, s + 1, 0, 14)}
        render={(i, _s, _x, _y, _a, v) => (
          <g transform={`translate(0 ${range(i, 5, -8, 8)})`}>
            <rect x={-4} y={-6} width={8} height={22} fill="#8a5a33" />
            <circle cy={-16} r={15 + v * 12} fill={v > 0.5 ? "#3f8f5c" : "#4a9c5c"} />
            <circle cx={-9} cy={-10} r={9 + v * 8} fill="#35854a" />
          </g>
        )}
      />

      {/* lantern ropes + hanging lanterns along the banks */}
      <path d={bankPath(chapter, -1, 122)} stroke="#8a5a2b" strokeWidth="2.5" fill="none" opacity="0.85" />
      <path d={bankPath(chapter, 1, 122)} stroke="#8a5a2b" strokeWidth="2.5" fill="none" opacity="0.85" />
      <BankItems
        chapter={chapter}
        step={54}
        salt={11}
        dist={122}
        render={(_i, _s, _x, _y, a, _v) => (
          <g transform={`rotate(${-a})`}>
            <circle r="8" fill="#ffb84d" opacity="0.25" />
            <rect x="-3" y="-4" width="6" height="4" rx="1.6" fill="#b8322c" />
            <ellipse cy="4" rx="4.2" ry="5.6" fill="#f4842f" />
            <path d="M0 9.6 l0 6" stroke="#e0b552" strokeWidth="1.5" />
          </g>
        )}
      />

      {/* lamp posts */}
      <BankItems chapter={chapter} step={320} salt={17} dist={134} render={() => <LampPost x={0} y={-81} />} />

      {/* scattered petals / leaves on the outer ground */}
      <BankItems
        chapter={chapter}
        step={58}
        salt={29}
        dist={(i, s) => 218 + range(i, s + 3, 0, 60)}
        render={(i, _s, _x, _y, _a, v) => (
          <ellipse rx={3 + v * 3} ry={1.6 + v * 1.4} fill={v > 0.5 ? "#ff9ec4" : "#ffc98e"} opacity={0.8} transform={`rotate(${range(i, 6, 0, 180)})`} />
        )}
      />

      <MistBand y={h * 0.5} id={`${P}-mist`} />
      <MistBand y={h * 0.82} id={`${P}-mist`} h={22} />
    </>
  );
}

/* ------------------------------- Huế -------------------------------- */

function HueScene({ chapter }: SceneProps) {
  const { height: h, id } = chapter;
  const P = `scene-d-${id}`;
  return (
    <>
      <defs>
        <linearGradient id={`${P}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9f2c6" />
          <stop offset="48%" stopColor="#a5d688" />
          <stop offset="100%" stopColor="#62a34a" />
        </linearGradient>
        <linearGradient id={`${P}-mist`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <pattern id={`${P}-tiles`} width="18" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 6 q9 -9 18 0" fill="none" stroke="#5a3f6e" strokeWidth="1.8" />
        </pattern>
      </defs>

      <rect width="430" height={h} fill={`url(#${P}-sky)`} />

      {/* moon + stars */}
      <circle cx="118" cy={h * 0.12} r="22" fill="#fdf8d8" />
      <circle cx="110" cy={h * 0.11} r="22" fill="#d9ecc8" opacity="0.9" />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={20 + ((i * 149) % 400)} cy={h * (0.05 + ((i * 7) % 9) * 0.025)} r={1.6 + (i % 2)} fill="#f2fae4" opacity="0.8" />
      ))}
      <Clouds ys={[h * 0.16, h * 0.42, h * 0.7]} color="#e6f5d2" />

      {/* distant citadel silhouette */}
      <SilhouetteBank chapter={chapter} side={-1} dist={248} color="#6f9c60" opacity={0.5} spike={64} from={h * 0.12} />
      <SilhouetteBank chapter={chapter} side={1} dist={248} color="#6f9c60" opacity={0.5} spike={64} from={h * 0.12} />

      {/* citadel walls hugging both banks */}
      <RibbonBank chapter={chapter} side={-1} d1={106} d2={144} fill="#b98954" edge="#7d5933" merlon={26} />
      <RibbonBank chapter={chapter} side={1} d1={106} d2={144} fill="#b98954" edge="#7d5933" merlon={26} />

      {/* gates (Ngọ Môn) at intervals */}
      <BankItems
        chapter={chapter}
        step={520}
        salt={7}
        dist={(i, s) => 126 + range(i, s + 1, 0, 8)}
        from={h * 0.2}
        render={(_i, _s, _x, _y, _a, v) => (v > 0.45 ? <HueGate x={0} y={-40} s={0.85 + v * 0.25} id={`${P}-tiles`} /> : null)}
      />

      {/* lotus ponds along the outer side of the wall */}
      <BankItems
        chapter={chapter}
        step={240}
        salt={19}
        dist={(i, s) => 168 + range(i, s + 2, 0, 10)}
        render={(i, _s, _x, _y, _a, v) =>
          v > 0.35 ? (
            <g>
              <ellipse rx={30 + v * 20} ry={8} fill="#4f9b5a" opacity="0.9" />
              <LotusFlower s={0.8} />
              {v > 0.7 && <LotusFlower s={0.6} />}
            </g>
          ) : null
        }
      />

      {/* lavender blossom trees */}
      <BankItems
        chapter={chapter}
        step={92}
        salt={23}
        dist={(i, s) => 188 + range(i, s + 3, 0, 14)}
        render={(i, _s, _x, _y, _a, v) => (
          <g transform={`translate(0 ${range(i, 7, -8, 8)})`}>
            <rect x={-3} y={-4} width={6} height={18} fill="#8a5a33" />
            <circle cy={-14} r={12 + v * 8} fill={v > 0.5 ? "#c9a8e8" : "#b793dc"} />
            <circle cx={-7} cy={-9} r={8 + v * 5} fill="#d8c0f0" />
          </g>
        )}
      />

      <MistBand y={h * 0.55} id={`${P}-mist`} />
      <MistBand y={h * 0.86} id={`${P}-mist`} h={22} />
    </>
  );
}

/* ----------------------------- Tây Nguyên ---------------------------- */

function TayNguyenScene({ chapter }: SceneProps) {
  const { height: h, id } = chapter;
  const P = `scene-d-${id}`;
  return (
    <>
      <defs>
        <linearGradient id={`${P}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dbf2c2" />
          <stop offset="50%" stopColor="#a3d578" />
          <stop offset="100%" stopColor="#6ab04a" />
        </linearGradient>
        <linearGradient id={`${P}-mist`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.13" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="430" height={h} fill={`url(#${P}-sky)`} />
      <circle cx="90" cy={h * 0.14} r="26" fill="#fdfef2" />
      <circle cx="90" cy={h * 0.14} r="56" fill="#f8fce0" opacity="0.5" />
      <ellipse cx="330" cy={h * 0.1} rx="62" ry="13" fill="#e8f6cc" opacity="0.55" />
      <ellipse cx="140" cy={h * 0.22} rx="48" ry="11" fill="#ddf2c0" opacity="0.5" />

      {/* rolling highland hills hugging the river */}
      <SilhouetteBank chapter={chapter} side={-1} dist={256} color="#4a7a56" opacity={0.6} amp={22} freq={0.011} from={h * 0.1} />
      <SilhouetteBank chapter={chapter} side={1} dist={256} color="#4a7a56" opacity={0.6} amp={22} freq={0.011} from={h * 0.1} />
      <SilhouetteBank chapter={chapter} side={-1} dist={216} color="#2f5a42" opacity={0.9} amp={26} freq={0.013} from={h * 0.18} />
      <SilhouetteBank chapter={chapter} side={1} dist={216} color="#2f5a42" opacity={0.9} amp={26} freq={0.013} from={h * 0.18} />

      {/* pine line */}
      <BankItems
        chapter={chapter}
        step={84}
        salt={31}
        dist={(i, s) => 178 + range(i, s + 1, 0, 16)}
        render={(i, _s, _x, _y, _a, v) => (
          <g transform={`translate(0 ${range(i, 8, -10, 10)})`}>
            <Pine s={0.8 + v * 0.4} />
          </g>
        )}
      />

      {/* coffee bushes along the bank edge */}
      <BankItems
        chapter={chapter}
        step={62}
        salt={37}
        dist={(i, s) => 116 + range(i, s + 2, 0, 12)}
        render={(i, _s, _x, _y, _a, v) => (
          <g transform={`translate(0 ${range(i, 9, -6, 6)})`}>
            <CoffeeBush s={0.7 + v * 0.5} />
          </g>
        )}
      />

      {/* grass tufts on the open ground */}
      <BankItems
        chapter={chapter}
        step={48}
        salt={47}
        dist={(i, s) => 210 + range(i, s + 4, 0, 56)}
        render={(i, _s, _x, _y, _a, v) => <GrassTuft s={0.7 + v * 0.6} />}
      />

      <MistBand y={h * 0.58} id={`${P}-mist`} />
      <MistBand y={h * 0.88} id={`${P}-mist`} h={20} />
    </>
  );
}

/* ------------------------------ Phú Quốc ----------------------------- */

function PhuQuocScene({ chapter }: SceneProps) {
  const { height: h, id } = chapter;
  const P = `scene-d-${id}`;
  return (
    <>
      <defs>
        <linearGradient id={`${P}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cdeec4" />
          <stop offset="100%" stopColor="#7ecf82" />
        </linearGradient>
        <linearGradient id={`${P}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7cc9a0" />
          <stop offset="100%" stopColor="#4aa373" />
        </linearGradient>
        <linearGradient id={`${P}-mist`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="430" height={h} fill={`url(#${P}-sky)`} />
      <circle cx="215" cy={h * 0.12} r="30" fill="#fdfef0" />
      <circle cx="215" cy={h * 0.12} r="64" fill="#f4fbd8" opacity="0.45" />
      <ellipse cx="80" cy={h * 0.08} rx="56" ry="12" fill="#ffffff" opacity="0.55" />
      <ellipse cx="340" cy={h * 0.18} rx="66" ry="13" fill="#ffffff" opacity="0.4" />

      {/* distant islands hugging the river edges */}
      <SilhouetteBank chapter={chapter} side={-1} dist={290} color="#5d9c6b" opacity={0.55} amp={16} freq={0.009} from={h * 0.16} />
      <SilhouetteBank chapter={chapter} side={1} dist={290} color="#5d9c6b" opacity={0.55} amp={16} freq={0.009} from={h * 0.16} />
      <SilhouetteBank chapter={chapter} side={-1} dist={242} color="#4c8a5c" opacity={0.7} amp={12} freq={0.012} from={h * 0.22} />
      <SilhouetteBank chapter={chapter} side={1} dist={242} color="#4c8a5c" opacity={0.7} amp={12} freq={0.012} from={h * 0.22} />

      {/* sea + waves */}
      <rect x="0" y={h * 0.26} width="430" height={h * 0.74} fill={`url(#${P}-sea)`} />
      {Array.from({ length: Math.max(3, Math.floor(h / 140)) }, (_, i) => (
        <path
          key={i}
          d={waveLine(h * 0.3 + i * 140 + range(i, 5, -18, 18))}
          stroke="#ffffff"
          strokeWidth="3"
          fill="none"
          opacity={0.16 + hash(i, 9) * 0.18}
        />
      ))}

      {/* sand banks hugging the river */}
      <RibbonBank chapter={chapter} side={-1} d1={126} d2={176} fill="#f3dcae" edge="#e4c88f" />
      <RibbonBank chapter={chapter} side={1} d1={126} d2={176} fill="#f3dcae" edge="#e4c88f" />

      {/* sailboats out on the sea */}
      <BankItems
        chapter={chapter}
        step={300}
        salt={51}
        dist={(i, s) => 224 + range(i, s + 1, 0, 30)}
        from={h * 0.4}
        render={(_i, _s, _x, _y, _a, v) => (v > 0.55 ? <Sailboat s={0.6 + v * 0.4} /> : null)}
      />

      {/* palms on the sand */}
      <BankItems
        chapter={chapter}
        step={240}
        salt={53}
        dist={(i, s) => 166 + range(i, s + 2, 0, 8)}
        render={(i, _s, _x, _y, _a, v) =>
          v > 0.35 ? (
            <g transform={`translate(0 ${range(i, 6, -4, 4)})`}>
              <Palm s={0.85 + v * 0.3} />
            </g>
          ) : null
        }
      />

      {/* starfish + shells on the sand */}
      <BankItems
        chapter={chapter}
        step={118}
        salt={57}
        dist={(i, s) => 190 + range(i, s + 3, 0, 26)}
        render={(_i, _s, _x, _y, _a, v) => (v > 0.4 ? <Starfish s={0.6 + v * 0.4} /> : null)}
      />
      <BankItems
        chapter={chapter}
        step={44}
        salt={59}
        dist={(i, s) => 148 + range(i, s + 4, 0, 10)}
        render={(i, _s, _x, _y, _a, v) => (
          <ellipse rx={4 + v * 3} ry={3 + v * 2} fill={v > 0.5 ? "#e8d3a0" : "#d9c185"} stroke="#c9a86a" strokeWidth="1.2" />
        )}
      />

      <MistBand y={h * 0.78} id={`${P}-mist`} />
    </>
  );
}

/* ------------------------------ Ninh Bình ---------------------------- */

function NinhBinhScene({ chapter }: SceneProps) {
  const { height: h, id } = chapter;
  const P = `scene-d-${id}`;
  // patchwork paddy bands with irregular heights
  const paddies: ReactNode[] = [];
  {
    let py = h * 0.3;
    let bi = 0;
    while (py < h) {
      const bh = 84 + hash(bi, 3) * 44;
      paddies.push(
        <g key={bi}>
          <rect x="0" y={py} width="430" height={bh} fill={bi % 2 ? "#8cc165" : "#79b95a"} />
          <rect x="0" y={py + bh - 4} width="430" height="4" fill="#5f8a42" opacity="0.55" />
          <path
            d={`M0 ${py + bh * 0.3} q40 -12 80 0 q40 12 80 0 q40 -12 80 0 q40 12 80 0 q40 -12 80 0 q40 12 70 0`}
            stroke="#b9d98a"
            strokeWidth="2.4"
            fill="none"
            opacity="0.7"
          />
          <rect x={hash(bi, 7) * 250} y={py + bh * 0.45} width="88" height={bh * 0.36} rx="10" fill="#a8dcc8" opacity="0.8" />
        </g>
      );
      py += bh;
      bi++;
    }
  }
  return (
    <>
      <defs>
        <linearGradient id={`${P}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cdeee0" />
          <stop offset="100%" stopColor="#8fc7a8" />
        </linearGradient>
        <linearGradient id={`${P}-mist`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="430" height={h} fill={`url(#${P}-sky)`} />
      <circle cx="330" cy={h * 0.1} r="22" fill="#fff7dc" />
      <circle cx="330" cy={h * 0.1} r="48" fill="#fff0b8" opacity="0.45" />
      <ellipse cx="80" cy={h * 0.08} rx="58" ry="12" fill="#ffffff" opacity="0.5" />
      <ellipse cx="230" cy={h * 0.17} rx="64" ry="13" fill="#ffffff" opacity="0.35" />

      {/* far karst silhouettes hugging the river */}
      <SilhouetteBank chapter={chapter} side={-1} dist={258} color="#5d8f6e" opacity={0.55} amp={18} freq={0.01} from={h * 0.2} />
      <SilhouetteBank chapter={chapter} side={1} dist={258} color="#5d8f6e" opacity={0.55} amp={18} freq={0.01} from={h * 0.2} />

      {paddies}

      {/* big karst towers at intervals along the banks */}
      <BankItems
        chapter={chapter}
        step={540}
        salt={61}
        dist={(i, s) => 142 + range(i, s + 1, 0, 10)}
        from={h * 0.32}
        render={(_i, _s, _x, _y, _a, v) => (v > 0.5 ? <Karst s={0.85 + v * 0.4} /> : null)}
      />

      {/* reeds right on the bank edge */}
      <BankItems
        chapter={chapter}
        step={66}
        salt={67}
        dist={(i, s) => 94 + range(i, s + 2, 0, 8)}
        render={(i, _s, _x, _y, _a, v) => (
          <g transform={`translate(0 ${range(i, 8, -4, 4)})`}>
            <ReedTuft s={0.6 + v * 0.4} />
          </g>
        )}
      />

      {/* storks */}
      <BankItems
        chapter={chapter}
        step={210}
        salt={71}
        dist={(i, s) => 120 + range(i, s + 3, 0, 10)}
        from={h * 0.4}
        render={(_i, _s, _x, _y, _a, v) => (v > 0.45 ? <Stork s={0.7 + v * 0.4} flip={v > 0.75} /> : null)}
      />

      <MistBand y={h * 0.56} id={`${P}-mist`} />
      <MistBand y={h * 0.88} id={`${P}-mist`} h={22} />
    </>
  );
}

/* -------------------------------- Sa Pa ------------------------------ */

function SaPaScene({ chapter }: SceneProps) {
  const { height: h, id } = chapter;
  const P = `scene-d-${id}`;
  const fogYs = [h * 0.14, h * 0.4, h * 0.66, h * 0.92];
  return (
    <>
      <defs>
        <linearGradient id={`${P}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9f0c9" />
          <stop offset="100%" stopColor="#a5d18d" />
        </linearGradient>
        <linearGradient id={`${P}-mist`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="430" height={h} fill={`url(#${P}-sky)`} />
      <circle cx="120" cy={h * 0.09} r="20" fill="#fdf3d8" opacity="0.9" />
      <circle cx="120" cy={h * 0.09} r="44" fill="#ffffff" opacity="0.35" />
      <ellipse cx="340" cy={h * 0.06} rx="70" ry="14" fill="#ffffff" opacity="0.4" />

      {/* mountain layers with snowy ridges hugging the river */}
      <SilhouetteBank chapter={chapter} side={-1} dist={268} color="#9dc487" opacity={0.85} amp={16} freq={0.009} from={h * 0.06} />
      <SilhouetteBank chapter={chapter} side={1} dist={268} color="#9dc487" opacity={0.85} amp={16} freq={0.009} from={h * 0.06} />
      <SilhouetteBank chapter={chapter} side={-1} dist={236} color="#7ba968" opacity={0.95} amp={20} freq={0.011} from={h * 0.14} />
      <SilhouetteBank chapter={chapter} side={1} dist={236} color="#7ba968" opacity={0.95} amp={20} freq={0.011} from={h * 0.14} />
      {/* snow line along the ridge */}
      <path d={bankPath(chapter, -1, 236, 14)} stroke="#ffffff" strokeWidth="6" fill="none" opacity="0.4" strokeLinecap="round" />
      <path d={bankPath(chapter, 1, 236, 14)} stroke="#ffffff" strokeWidth="6" fill="none" opacity="0.4" strokeLinecap="round" />

      {/* fog */}
      {fogYs.map((fy, i) => (
        <MistBand key={i} y={fy} id={`${P}-mist`} h={30 + (i % 2) * 16} />
      ))}
      <ellipse cx="120" cy={h * 0.3} rx="140" ry="34" fill="#ffffff" opacity="0.14" />
      <ellipse cx="330" cy={h * 0.62} rx="150" ry="36" fill="#ffffff" opacity="0.13" />

      {/* terraced rice fields on the slopes */}
      <BankItems
        chapter={chapter}
        step={250}
        salt={71}
        dist={(i, s) => 166 + range(i, s + 1, 0, 12)}
        from={h * 0.28}
        render={(i, _s, _x, _y, _a, v) => (
          <g transform={`translate(0 ${range(i, 6, -10, 10)})`}>
            <Terraces s={0.85 + v * 0.3} flip={v > 0.5} />
          </g>
        )}
      />

      {/* pines */}
      <BankItems
        chapter={chapter}
        step={88}
        salt={79}
        dist={(i, s) => 194 + range(i, s + 3, 0, 14)}
        render={(i, _s, _x, _y, _a, v) => (
          <g transform={`translate(0 ${range(i, 9, -10, 10)})`}>
            <Pine s={0.7 + v * 0.35} />
          </g>
        )}
      />

      {/* peach blossoms */}
      <BankItems
        chapter={chapter}
        step={140}
        salt={83}
        dist={(i, s) => 214 + range(i, s + 4, 0, 30)}
        render={(i, _s, _x, _y, _a, v) => (
          <g>
            <circle cx={-4} r={5 + v * 4} fill="#ffb3c8" opacity="0.9" />
            <circle cx={5} cy={4} r={4 + v * 3} fill="#ff9eb8" opacity="0.9" />
            <circle cy={-4} r={4 + v * 3} fill="#ffc2d4" opacity="0.9" />
          </g>
        )}
      />
    </>
  );
}

/* ------------------------------- Hà Nội ------------------------------ */

function HanoiScene({ chapter }: SceneProps) {
  const { height: h, id } = chapter;
  const P = `scene-d-${id}`;
  return (
    <>
      <defs>
        <linearGradient id={`${P}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dcf5c4" />
          <stop offset="48%" stopColor="#a2da80" />
          <stop offset="100%" stopColor="#6db558" />
        </linearGradient>
        <linearGradient id={`${P}-mist`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <pattern id={`${P}-tiles`} width="18" height="13" patternUnits="userSpaceOnUse">
          <path d="M0 7 q9 -9 18 0" fill="none" stroke="#4a5d6b" strokeWidth="1.8" />
        </pattern>
      </defs>

      <rect width="430" height={h} fill={`url(#${P}-sky)`} />
      <circle cx="110" cy={h * 0.13} r="24" fill="#fdfef2" />
      <circle cx="110" cy={h * 0.13} r="52" fill="#f8fce0" opacity="0.5" />
      <ellipse cx="330" cy={h * 0.08} rx="60" ry="12" fill="#e8f6cc" opacity="0.55" />
      <ellipse cx="170" cy={h * 0.21} rx="52" ry="11" fill="#ddf2c0" opacity="0.45" />

      {/* distant Hà Nội skyline hugging the river */}
      <SilhouetteBank chapter={chapter} side={-1} dist={250} color="#7da45c" opacity={0.5} spike={62} from={h * 0.1} />
      <SilhouetteBank chapter={chapter} side={1} dist={250} color="#7da45c" opacity={0.5} spike={62} from={h * 0.1} />
      <SilhouetteBank chapter={chapter} side={-1} dist={204} color="#5f8a43" opacity={0.88} spike={44} from={h * 0.16} />
      <SilhouetteBank chapter={chapter} side={1} dist={204} color="#5f8a43" opacity={0.88} spike={44} from={h * 0.16} />

      {/* banyan trees */}
      <BankItems
        chapter={chapter}
        step={310}
        salt={83}
        dist={(i, s) => 170 + range(i, s + 3, 0, 8)}
        from={h * 0.3}
        render={(_i, _s, _x, _y, _a, v) => (v > 0.5 ? <Banyan s={0.75 + v * 0.35} /> : null)}
      />

      {/* Tháp Rùa towers on little mounds */}
      <BankItems
        chapter={chapter}
        step={760}
        salt={87}
        dist={(i, s) => 178 + range(i, s + 4, 0, 8)}
        from={h * 0.4}
        render={(_i, _s, _x, _y, _a, v) => (v > 0.5 ? <TurtleTower s={0.8 + v * 0.25} /> : null)}
      />

      {/* drifting autumn leaves */}
      <BankItems
        chapter={chapter}
        step={54}
        salt={91}
        dist={(i, s) => 130 + range(i, s + 5, 0, 10)}
        render={(i, _s, _x, _y, _a, v) => (
          <ellipse
            rx={4 + v * 2.4}
            ry={2 + v * 1.2}
            fill={v > 0.5 ? "#f4c14e" : "#e8a84b"}
            opacity={0.85}
            transform={`rotate(${range(i, 6, 0, 180)})`}
          />
        )}
      />

      {/* lamp posts */}
      <BankItems chapter={chapter} step={320} salt={97} dist={136} render={() => <LampPost x={0} y={-81} />} />

      <MistBand y={h * 0.5} id={`${P}-mist`} />
      <MistBand y={h * 0.82} id={`${P}-mist`} h={22} />
    </>
  );
}

/* ------------------------------------------------------------------ */

const DETAILED: Record<number, (p: SceneProps) => ReactNode> = {};

export default function DetailedScene({ chapter }: { chapter: Chapter }) {
  const Fn = DETAILED[chapter.id];
  if (!Fn) return null;
  return (
    <svg
      width={430}
      height={chapter.height}
      viewBox={`0 0 430 ${chapter.height}`}
      preserveAspectRatio="none"
      className="absolute left-0 top-0"
    >
      <Fn chapter={chapter} />
    </svg>
  );
}
