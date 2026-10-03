import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { AnswerState, BuildQ, Phase } from "../lib/game";
import { evalTokens } from "../lib/game";
import { sfx } from "../lib/audio";

interface Props {
  q: BuildQ;
  phase: Phase;
  onChange: (s: AnswerState) => void;
}

const OP_COLOR = "#35B2E2";

export default function CompleteEquation({ q, phase, onChange }: Props) {
  const [used, setUsed] = useState<number[]>([]); // tile indices, in order

  useEffect(() => {
    const tokens = used.map((i) => q.tiles[i]);
    const value = evalTokens(tokens);
    onChange({ ready: value !== null, correct: value !== null && value === q.target });
  }, [used, q, onChange]);

  const addTile = (i: number) => {
    if (phase !== "answer" || used.includes(i) || used.length >= 5) return;
    sfx.select();
    setUsed((u) => [...u, i]);
  };
  const removeAt = (pos: number) => {
    if (phase !== "answer") return;
    sfx.click();
    setUsed((u) => u.filter((_, idx) => idx !== pos));
  };

  const tokens = used.map((i) => q.tiles[i]);
  const liveValue = evalTokens(tokens);

  const boxBorder = phase === "right" ? "#89E219" : phase === "wrong" ? "#FF4B4B" : "#2F5C74";

  return (
    <div className="flex flex-col items-center gap-12 w-full">
      {/* equation + drop box */}
      <div className="flex items-center gap-4 w-full max-w-md">
        <div className="font-display font-extrabold text-5xl flex items-center gap-3">
          <span>{q.target}</span>
          <span style={{ color: OP_COLOR }}>=</span>
        </div>
        <motion.div
          key={phase === "wrong" ? "wrong" : "ok"}
          className={`flex-1 min-h-[68px] rounded-xl border-2 bg-[#14222C] flex flex-wrap items-center justify-center gap-2 px-2 py-2 transition-colors ${phase === "wrong" ? "animate-shake" : ""}`}
          style={{ borderColor: boxBorder }}
        >
          {tokens.length === 0 && <span className="text-[#41596B] font-display font-bold text-lg select-none">Ghép các ô bên dưới</span>}
          {tokens.map((t, pos) => {
            return (
              <motion.button
                key={`${pos}-${t}`}
                initial={{ scale: 0.6, y: -6 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 16, stiffness: 400 }}
                onClick={() => removeAt(pos)}
                disabled={phase !== "answer"}
                className="tile w-12 h-12 grid place-items-center font-display font-extrabold text-xl !text-[#062733]"
                style={{ background: "#35B2E2", borderColor: "#35B2E2", boxShadow: "0 4px 0 #1D82AC" }}
              >
                {t}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* live evaluation preview */}
      <div className="h-6 -my-8 font-display font-bold text-lg" style={{ color: liveValue === q.target ? "#89E219" : "#41596B" }}>
        {liveValue !== null ? `= ${liveValue}` : ""}
      </div>

      {/* available tiles */}
      <div className="flex flex-wrap justify-center gap-3 max-w-sm">
        {q.tiles.map((t, i) => {
          const isUsed = used.includes(i);
          const isOp = t === "+" || t === "−";
          if (isUsed) return <div key={i} className="tile-slot w-16 h-16" />;
          return (
            <button
              key={i}
              onClick={() => addTile(i)}
              className={`tile w-16 h-16 grid place-items-center font-display font-extrabold ${isOp ? "text-3xl" : "text-2xl"}`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {phase === "wrong" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 font-display font-extrabold text-2xl">
          <span className="text-[#7A93A3] text-base font-bold uppercase tracking-wider mr-2">Đáp án:</span>
          {q.solution.map((t, i) => (
            <span key={i} className="w-11 h-11 grid place-items-center rounded-xl border-2 border-[#58A700] bg-[#1E2F16] text-[#89E219]">
              {t}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
