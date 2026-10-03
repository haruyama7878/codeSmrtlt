import { useCallback, useEffect, useState } from "react";
import { Delete } from "lucide-react";
import type { AnswerState, Phase, TypeQ } from "../lib/game";
import { sfx } from "../lib/audio";

interface Props {
  q: TypeQ;
  phase: Phase;
  onChange: (s: AnswerState) => void;
}

const OP_COLOR = "#35B2E2";

export default function TypeAnswer({ q, phase, onChange }: Props) {
  const [val, setVal] = useState("");

  const report = useCallback(
    (s: string) => {
      onChange({ ready: s.length > 0, correct: s.length > 0 && parseInt(s, 10) === q.answer });
    },
    [onChange, q.answer],
  );

  useEffect(() => report(""), [report]);

  const push = (d: string) => {
    if (phase !== "answer") return;
    if (val.length >= 4) return;
    const next = (val + d).replace(/^0+(?=\d)/, "");
    sfx.select();
    setVal(next);
    report(next);
  };
  const pop = () => {
    if (phase !== "answer") return;
    const next = val.slice(0, -1);
    setVal(next);
    report(next);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase !== "answer") return;
      if (/^[0-9]$/.test(e.key)) push(e.key);
      else if (e.key === "Backspace") pop();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const boxBorder = phase === "right" ? "#89E219" : phase === "wrong" ? "#FF4B4B" : "#35B2E2";
  const textColor = phase === "right" ? "#89E219" : phase === "wrong" ? "#FF4B4B" : "#EAF4FB";

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="flex flex-col items-center gap-12 w-full">
      <div className="flex items-center gap-3 sm:gap-4 font-display font-extrabold text-4xl sm:text-5xl">
        <span>{q.a}</span>
        <span style={{ color: OP_COLOR }}>{q.op}</span>
        <span>{q.b}</span>
        <span style={{ color: OP_COLOR }}>=</span>
        <div
          className="min-w-[72px] h-[64px] px-3 rounded-xl border-2 grid place-items-center bg-[#16242E] transition-colors"
          style={{ borderColor: boxBorder, color: textColor }}
        >
          {val.length > 0 ? (
            val
          ) : (
            <span className="caret inline-block w-[3px] h-8 rounded bg-[#35B2E2]" />
          )}
        </div>
      </div>

      {/* on-screen numpad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[300px]">
        {keys.map((k) => (
          <button key={k} onClick={() => push(k)} className="tile h-16 font-display font-extrabold text-2xl grid place-items-center">
            {k}
          </button>
        ))}
        <div />
        <button onClick={() => push("0")} className="tile h-16 font-display font-extrabold text-2xl grid place-items-center">
          0
        </button>
        <button onClick={pop} className="tile h-16 grid place-items-center text-[#7A93A3]" aria-label="Xóa">
          <Delete size={26} />
        </button>
      </div>
    </div>
  );
}
