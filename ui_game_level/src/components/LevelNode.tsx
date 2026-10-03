import { memo, type CSSProperties } from "react";
import type { Level } from "../lib/map";
import { Chest, Crown, Frog, Lotus, Padlock, StarIcon } from "./art";

/* ------------------------- lily pad shape ------------------------- */

function padPath(r: number, lobes = 8) {
  let d = "";
  for (let i = 0; i < lobes; i++) {
    const a0 = (i / lobes) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / lobes) * Math.PI * 2 - Math.PI / 2;
    const am = (a0 + a1) / 2;
    const x0 = Math.cos(a0) * r;
    const y0 = Math.sin(a0) * r;
    const x1 = Math.cos(a1) * r;
    const y1 = Math.sin(a1) * r;
    const cx = Math.cos(am) * r * 1.16;
    const cy = Math.sin(am) * r * 1.16;
    d += `${i === 0 ? "M" : "L"} ${x0.toFixed(1)} ${y0.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)} `;
  }
  return `${d} Z`;
}

function PadSvg({
  size,
  tone,
  id,
  rot,
}: {
  size: number;
  tone: "green" | "gold" | "grey" | "bloom";
  id: string;
  rot: number;
}) {
  const r = 44;
  const fills = {
    green: { body: "#6fce38", light: "#bdf26a", dark: "#3e9b1f", rim: "#e6f8b0" },
    gold: { body: "#f7c83e", light: "#ffed95", dark: "#c98f0e", rim: "#fff5c8" },
    grey: { body: "#adbaac", light: "#dce4d6", dark: "#7f8f82", rim: "#eef3e8" },
    bloom: { body: "#ff9ec4", light: "#ffd0e2", dark: "#d65f96", rim: "#ffe4ef" },
  }[tone];
  const veins = Array.from({ length: 9 }, (_, i) => {
    // veins radiate around the center, skipping the notch area
    const a = 0.65 + (i / 9) * Math.PI * 1.75;
    return {
      x2: Math.cos(a) * r * 0.82,
      y2: Math.sin(a) * r * 0.82,
      cx: Math.cos(a + 0.22) * r * 0.4,
      cy: Math.sin(a + 0.22) * r * 0.4,
    };
  });
  return (
    <svg width={size} height={size} viewBox="-60 -60 120 120" style={{ transform: `rotate(${rot}deg)` }}>
      <ellipse cx="3" cy="9" rx={r + 4} ry={r} fill="rgba(6,40,60,0.28)" />
      {/* leaf body */}
      <path d={padPath(r)} fill={fills.body} stroke={fills.dark} strokeWidth="2.5" />
      {/* inner highlight */}
      <path d={padPath(r * 0.62)} fill={fills.light} opacity="0.5" />
      {/* raised rim */}
      <path
        d={padPath(r * 0.85)}
        fill="none"
        stroke={fills.rim}
        strokeWidth="3.2"
        opacity="0.75"
        strokeLinejoin="round"
      />
      {/* veins */}
      {veins.map((v, i) => (
        <path
          key={i}
          d={`M 0 0 Q ${v.cx} ${v.cy} ${v.x2} ${v.y2}`}
          stroke="#ffffff"
          strokeOpacity="0.32"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
      ))}
      {/* leaf center */}
      <circle r="4.5" fill="#ffffff" opacity="0.55" />
      {/* deep wedge notch opening to the water */}
      <path
        d="M 0 0 L 30 34 A 40 40 0 0 1 44 8 Z"
        fill="#16a87f"
        stroke={fills.dark}
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.92"
      />
    </svg>
  );
}

/* ---------------------------- node ---------------------------- */

export type NodeState = "done" | "current" | "locked";

function LevelNodeInner({
  level,
  state,
  stars,
  opened,
  onClick,
  heroHidden,
  hardDone,
}: {
  level: Level;
  state: NodeState;
  stars: number;
  opened: boolean;
  onClick: () => void;
  heroHidden?: boolean;
  hardDone?: boolean;
}) {
  const boss = level.type === "boss";
  const chest = level.type === "chest";
  const size = boss ? 122 : chest ? 104 : 96;
  const localN = level.localN; // số thứ tự bài trong chương
  const tone =
    hardDone && state === "done"
      ? "bloom"
      : state === "locked"
        ? "grey"
        : boss
          ? "gold"
          : "green";
  const rot = ((level.n * 47) % 40) - 20;

  return (
    <div
      className="absolute z-40"
      style={{ left: level.pad.x, top: level.pad.y, transform: "translate(-50%, -50%)" }}
    >
      <button
        onClick={onClick}
        className="relative grid place-items-center transition-transform duration-150 active:scale-95"
        style={{ width: size, height: size }}
        aria-label={`Bài ${level.n}: ${level.goal}`}
      >
        {/* current level pulsing rings */}
        {state === "current" && (
          <>
            <span
              className="anim-ring pointer-events-none absolute rounded-full border-4 border-amber-300"
              style={{ width: size * 0.92, height: size * 0.92 }}
            />
            <span
              className="anim-ring pointer-events-none absolute rounded-full border-4 border-white/80"
              style={{ width: size * 0.92, height: size * 0.92, animationDelay: "0.9s" }}
            />
          </>
        )}

        <div className={state === "current" ? "anim-breathe" : "anim-bob-slow"}>
          <PadSvg size={size} tone={tone} id={`${level.n}-${tone}`} rot={rot} />
        </div>

        {/* level number (hidden once the pad has bloomed) */}
        {state !== "locked" && !chest && !(hardDone && state === "done") && (
          <span
            className={`absolute font-extrabold stroke-brown ${boss ? "text-[38px] text-amber-50" : "text-[32px] text-white"}`}
            style={{ transform: "translateY(-2px)" }}
          >
            {localN}
          </span>
        )}

        {chest && (
          <span
            className={`absolute grid place-items-center ${opened ? "opacity-70" : "anim-nudge"}`}
            style={{ transform: "translateY(-6px)" }}
          >
            <Chest className={state === "locked" ? "h-12 w-12 grayscale" : "h-14 w-14"} />
          </span>
        )}

        {state === "locked" && !chest && (
          <Padlock className="absolute h-9 w-9 text-slate-600/90" style={{ transform: "translateY(-2px)" }} />
        )}

        {/* boss crown */}
        {boss && state !== "locked" && (
          <Crown
            className="absolute h-8 w-8 text-amber-100 drop-shadow"
            style={{ top: -size * 0.16 }}
          />
        )}

        {/* blooming lotus for hard-mode clears: flower replaces the number */}
        {hardDone && state === "done" && (
          <>
            <span
              className="anim-sparkle pointer-events-none absolute h-3 w-3 rounded-full bg-white shadow-[0_0_6px_#fff]"
              style={{ top: -size * 0.3, left: -size * 0.28 }}
            />
            <span
              className="anim-sparkle pointer-events-none absolute h-2.5 w-2.5 rounded-full bg-amber-100 shadow-[0_0_6px_#ffe9a1]"
              style={{ top: -size * 0.26, left: size * 0.26, animationDelay: "0.6s" }}
            />
            <span
              className="anim-sparkle pointer-events-none absolute h-2 w-2 rounded-full bg-white shadow-[0_0_6px_#fff]"
              style={{ top: size * 0.14, left: -size * 0.32, animationDelay: "1.1s" }}
            />
            <div className="anim-bob-slow pointer-events-none absolute grid place-items-center">
              <span className="absolute h-[72px] w-[72px] rounded-full bg-amber-200/30 blur-[2px]" />
              <Lotus className="h-[48px] w-[52px] drop-shadow-lg" />
            </div>
          </>
        )}

        {/* stars for cleared levels */}
        {state === "done" && (
          <div className="absolute -top-1 flex gap-[1px]" style={{ top: -size * 0.13 }}>
            {[0, 1, 2].map((i) => (
              <StarIcon
                key={i}
                className={`h-5 w-5 drop-shadow ${i < stars ? "text-amber-300" : "text-black/25"}`}
              />
            ))}
          </div>
        )}

        {/* the hero sits on the current pad */}
        {state === "current" && !heroHidden && (
          <>
            <Frog className="anim-bob absolute h-[74px] w-[74px]" style={{ top: -size * 0.42 }} />
            <div
              className="anim-float absolute -top-[74px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl border-[3px] border-amber-900/80 bg-amber-50 px-3 py-1 text-[15px] font-extrabold text-amber-900 shadow-lg"
              style={{ animationDuration: "4s" }}
            >
              BẮT ĐẦU!
              <span className="absolute -bottom-[9px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-[3px] border-r-[3px] border-amber-900/80 bg-amber-50" />
            </div>
          </>
        )}
      </button>
    </div>
  );
}

export const LevelNode = memo(LevelNodeInner);

/* ---------------------------- chapter banner ---------------------------- */

export function ChapterBanner({
  title,
  range,
  topic,
  accent,
  y,
  done = false,
}: {
  title: string;
  range: string;
  topic?: string;
  accent: string;
  y: number;
  done?: boolean;
}) {
  const longTitle = title.length > 20;
  return (
    <div
      className="pointer-events-none absolute z-[45] flex w-full justify-center"
      style={{ top: y }}
    >
      <Cloud
        className="anim-float absolute left-[-20px] top-[-27px] h-12 w-24 opacity-90"
        style={{ animationDuration: "6s" }}
      />
      <Cloud
        className="anim-float absolute left-[-34px] top-[27px] h-9 w-[76px] opacity-75"
        style={{ animationDuration: "6s", animationDelay: "-2s" }}
      />
      <Cloud
        className="anim-float absolute right-[-20px] top-[-27px] h-12 w-24 scale-x-[-1] opacity-90"
        style={{ animationDuration: "6s", animationDelay: "-1s" }}
      />
      <Cloud
        className="anim-float absolute right-[-34px] top-[27px] h-9 w-[76px] scale-x-[-1] opacity-75"
        style={{ animationDuration: "6s", animationDelay: "-3s" }}
      />
      <div
        className={`anim-float relative z-10 flex items-center gap-2 rounded-full border-[5px] border-amber-900/85 bg-gradient-to-b from-amber-200 to-amber-400 py-2.5 shadow-[0_10px_0_rgba(120,53,15,0.55),0_16px_26px_rgba(0,0,0,0.35)] ${longTitle ? "px-5" : "px-7"}`}
        style={{ flexShrink: 0, maxWidth: longTitle ? 390 : undefined }}
      >
        {done && (
          <span className="absolute -top-4 right-7 whitespace-nowrap rounded-full border-[3px] border-white bg-emerald-500 px-3 py-0.5 text-[12px] font-extrabold text-white shadow-lg">
            ✓ Đã hoàn thành
          </span>
        )}
        <span className={`${longTitle ? "text-xl" : "text-2xl"}`}>🚩</span>
        <div className="text-center leading-none" style={{ maxWidth: 300 }}>
          <div className={`stroke-brown font-extrabold text-amber-50 ${longTitle ? "text-[16px]" : "text-[22px]"}`}>{title}</div>
          {topic && (
            <div className="mt-1 rounded-full bg-emerald-700/20 px-2 py-0.5 text-[11px] font-extrabold text-emerald-950">
              📐 {topic}
            </div>
          )}
          <div className="mt-0.5 text-[13px] font-bold text-amber-900/80">{range}</div>
        </div>
        <span className={`${longTitle ? "text-xl" : "text-2xl"}`}>🚩</span>
        <span
          className="absolute inset-x-3 -bottom-2 h-3 rounded-full opacity-60 blur-md"
          style={{ background: accent }}
        />
      </div>
    </div>
  );
}

function Cloud({ className, style }: { className: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 48" className={className} style={style} aria-hidden="true">
      <path
        d="M8 37 Q5 26 17 23 Q20 10 34 13 Q42 -1 56 12 Q70 7 76 20 Q92 17 94 31 Q96 42 83 43 H19 Q9 43 8 37 Z"
        fill="#fffdf1"
        stroke="#d6e6df"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M18 35 Q39 40 78 35" stroke="#c4d9d5" strokeWidth="3" fill="none" opacity="0.7" />
    </svg>
  );
}
