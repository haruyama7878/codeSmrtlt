import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { AnswerState, LineQ, Phase } from "../lib/game";
import { sfx } from "../lib/audio";

interface Props {
  q: LineQ;
  phase: Phase;
  onChange: (s: AnswerState) => void;
}

const OP_COLOR = "#35B2E2";

export default function NumberLine({ q, phase, onChange }: Props) {
  const [sel, setSel] = useState(0);
  const [touched, setTouched] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onChange({ ready: touched, correct: touched && sel === q.answer });
  }, [sel, touched, q.answer, onChange]);

  const setFromClientX = useCallback(
    (clientX: number) => {
      const el = areaRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const raw = ((clientX - r.left) / r.width) * q.max;
      const next = Math.max(0, Math.min(q.max, Math.round(raw)));
      setTouched(true);
      setSel(next);
    },
    [q.max],
  );

  const pct = (sel / q.max) * 100;
  const ticks = Array.from({ length: q.max + 1 }, (_, i) => i);
  const boxBorder = phase === "right" ? "#89E219" : phase === "wrong" ? "#FF4B4B" : "#35B2E2";
  const boxText = phase === "right" ? "#89E219" : phase === "wrong" ? "#FF4B4B" : "#EAF4FB";

  return (
    <div className="flex flex-col items-center gap-16 w-full">
      <div className="flex items-center gap-3 sm:gap-4 font-display font-extrabold text-4xl sm:text-5xl">
        <div
          className="min-w-[64px] h-[60px] px-3 rounded-xl border-2 grid place-items-center bg-[#16242E] transition-colors"
          style={{ borderColor: boxBorder, color: boxText }}
        >
          {touched ? sel : <span className="caret inline-block w-[3px] h-8 rounded bg-[#35B2E2]" />}
        </div>
        <span style={{ color: OP_COLOR }}>+</span>
        <span>{q.b}</span>
        <span style={{ color: OP_COLOR }}>=</span>
        <span>{q.c}</span>
      </div>

      {/* the line */}
      <div className="w-full max-w-md px-2">
        <div
          ref={areaRef}
          className="relative h-36 cursor-grab active:cursor-grabbing touch-none select-none"
          onPointerDown={(e) => {
            if (phase !== "answer") return;
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            sfx.select();
            setFromClientX(e.clientX);
          }}
          onPointerMove={(e) => {
            if (phase !== "answer") return;
            if (e.buttons === 1) setFromClientX(e.clientX);
          }}
        >
          {!touched && phase === "answer" && (
            <div className="absolute -top-8 inset-x-0 text-center font-display font-bold text-[#41596B]">
              Chạm hoặc kéo trên trục số
            </div>
          )}

          {/* horizontal rule */}
          <div className="absolute left-0 right-0 top-[34px] h-[3px] rounded bg-[#2B3E4A]" />

          {/* ticks + labels */}
          {ticks.map((i) => {
            const left = (i / q.max) * 100;
            const active = touched && i === sel;
            return (
              <div key={i} className="absolute top-[10px] flex flex-col items-center gap-1.5" style={{ left: `${left}%`, transform: "translateX(-50%)" }}>
                <span
                  className={`font-display text-xl transition-all ${active ? "font-extrabold text-[#35B2E2] scale-110" : "font-bold text-[#5F7A8C]"}`}
                >
                  {i}
                </span>
                <span className={`block w-[3px] h-[14px] rounded transition-colors ${active ? "bg-[#35B2E2]" : "bg-[#2B3E4A]"}`} />
              </div>
            );
          })}

          {/* marker */}
          <motion.div
            className="absolute top-[54px]"
            initial={false}
            animate={{ left: `${pct}%`, opacity: touched || phase !== "answer" ? 1 : 0.45 }}
            transition={{ type: "spring", damping: 22, stiffness: 320 }}
            style={{ transform: "translateX(-50%)" }}
          >
            <motion.div
              animate={touched ? { y: [0, -3, 0] } : {}}
              className="marker-shape w-9 h-9"
              style={{
                background:
                  phase === "right"
                    ? "linear-gradient(180deg,#A3F24D,#58A700)"
                    : phase === "wrong"
                      ? "linear-gradient(180deg,#FF7B7B,#C92A2A)"
                      : "linear-gradient(180deg,#6ED3F5,#1D82AC)",
                boxShadow: "0 6px 14px rgba(53,178,226,0.35)",
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
