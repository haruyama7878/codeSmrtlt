import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { AnswerState, Phase, SelectQ } from "../lib/game";
import { sfx } from "../lib/audio";

interface Props {
  q: SelectQ;
  phase: Phase;
  onChange: (s: AnswerState) => void;
}

const OP_COLOR = "#35B2E2";

function ExprText({ expr, className = "" }: { expr: string; className?: string }) {
  const parts = expr.split(" ");
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {parts.map((p, i) =>
        /[·+−÷×]/.test(p) ? (
          <span key={i} style={{ color: OP_COLOR }}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}

export default function SelectAllMatch({ q, phase, onChange }: Props) {
  const [chosen, setChosen] = useState<Set<number>>(new Set());

  useEffect(() => {
    const okIdx = new Set(q.options.map((o, i) => (o.ok ? i : -1)).filter((i) => i >= 0));
    const same = chosen.size === okIdx.size && [...chosen].every((i) => okIdx.has(i));
    onChange({ ready: chosen.size > 0, correct: same });
  }, [chosen, q, onChange]);

  const toggle = (i: number) => {
    if (phase !== "answer") return;
    sfx.select();
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center gap-14 w-full">
      <div className="flex items-center gap-4 font-display font-extrabold text-5xl">
        <span>{q.target}</span>
        <span style={{ color: OP_COLOR }}>=</span>
        <div
          className="min-w-[56px] h-[56px] rounded-xl border-2 grid place-items-center bg-[#16242E] transition-colors"
          style={{ borderColor: phase === "right" ? "#89E219" : phase === "wrong" ? "#FF4B4B" : "#35B2E2" }}
        >
          {phase === "answer" && <span className="caret inline-block w-[3px] h-7 rounded bg-[#35B2E2]" />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {q.options.map((o, i) => {
          const isChosen = chosen.has(i);
          let border = "#2B3E4A";
          let bg = "#1B2B36";
          let color = "#EAF4FB";
          if (phase === "answer" && isChosen) {
            border = "#35B2E2";
            bg = "#173449";
            color = "#7CD4F2";
          } else if (phase !== "answer" && o.ok) {
            border = "#58A700";
            bg = isChosen ? "#1E3312" : "#16242E";
            color = "#89E219";
          } else if (phase !== "answer" && !o.ok && isChosen) {
            border = "#C92A2A";
            bg = "#331B1B";
            color = "#FF8A8A";
          }
          return (
            <motion.button
              key={i}
              onClick={() => toggle(i)}
              className={`opt-card h-24 grid place-items-center font-display font-extrabold text-2xl ${phase !== "answer" && !o.ok && isChosen ? "animate-shake" : ""}`}
              style={{ borderColor: border, background: bg, color }}
              whileTap={phase === "answer" ? { scale: 0.97 } : undefined}
              disabled={phase !== "answer"}
            >
              <ExprText expr={o.expr} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
