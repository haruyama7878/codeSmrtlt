import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { sfx } from "../lib/audio";

// ── 3D Duolingo-style button ────────────────────────────────
const VARIANTS = {
  green: { bg: "#89E219", sh: "#58A700", text: "#1E3103" },
  blue: { bg: "#35B2E2", sh: "#1D82AC", text: "#04222F" },
  red: { bg: "#FF4B4B", sh: "#C92A2A", text: "#FFFFFF" },
  dark: { bg: "#243744", sh: "#14222C", text: "#EAF4FB" },
  ghost: { bg: "transparent", sh: "transparent", text: "#7A93A3" },
} as const;

interface DuoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: keyof typeof VARIANTS;
  silent?: boolean;
}

export function DuoButton({ color = "green", silent, className = "", children, onClick, ...rest }: DuoButtonProps) {
  const v = VARIANTS[color];
  const isGhost = color === "ghost";
  return (
    <button
      {...rest}
      onClick={(e) => {
        if (!silent && !rest.disabled) sfx.click();
        onClick?.(e);
      }}
      className={`font-display font-bold uppercase tracking-wider rounded-2xl px-6 py-3 ${isGhost ? "border-2 border-[#2B3E4A] hover:bg-[#1B2B36]" : "duo"} ${className}`}
      style={{ background: isGhost ? "transparent" : v.bg, color: v.text, "--sh": v.sh } as CSSProperties}
    >
      {children}
    </button>
  );
}

// ── progress bar ─────────────────────────────────────────────
export function ProgressBar({ value, color = "#FFC800" }: { value: number; color?: string }) {
  return (
    <div className="h-4 flex-1 rounded-full bg-[#22333F] overflow-hidden relative">
      <motion.div
        className="h-full rounded-full relative"
        style={{ background: color }}
        initial={false}
        animate={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
        transition={{ type: "spring", damping: 22, stiffness: 220 }}
      >
        <div className="absolute inset-x-3 top-[3px] h-[5px] rounded-full bg-white/25" />
      </motion.div>
    </div>
  );
}

// ── hearts ───────────────────────────────────────────────────
export function Hearts({ n }: { n: number }) {
  return (
    <motion.div
      key={n}
      initial={{ scale: 1.25 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-1 font-display font-extrabold text-lg text-[#FF5B6E]"
    >
      <Heart className="fill-[#FF5B6E] text-[#FF5B6E]" size={20} />
      {n}
    </motion.div>
  );
}

// ── avatar ───────────────────────────────────────────────────
export function Avatar({ name, hue, size = 38 }: { name: string; hue: number; size?: number }) {
  const initials = name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("");
  return (
    <div
      className="rounded-full grid place-items-center font-display font-extrabold text-white/95 shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, hsl(${hue} 72% 55%), hsl(${hue + 45} 72% 42%))`,
        boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.25)",
      }}
    >
      {initials}
    </div>
  );
}

// ── stat chip ────────────────────────────────────────────────
export function Chip({ icon, label, color }: { icon: ReactNode; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border-2 border-[#2B3E4A] bg-[#14222C] px-3 py-1.5">
      <span style={{ color }}>{icon}</span>
      <span className="font-display font-extrabold" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
