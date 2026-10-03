import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { AnswerState, MatchQ, Phase } from "../lib/game";
import { sfx } from "../lib/audio";

interface Props {
  q: MatchQ;
  phase: Phase;
  onChange: (s: AnswerState) => void;
}

const OP_COLOR = "#35B2E2";

export default function MatchPairs({ q, phase, onChange }: Props) {
  const [selL, setSelL] = useState<number | null>(null);
  const [selR, setSelR] = useState<number | null>(null);
  const [matchedL, setMatchedL] = useState<Set<number>>(new Set());
  const [matchedR, setMatchedR] = useState<Set<number>>(new Set());
  const [errorKey, setErrorKey] = useState(0);
  const [errorPair, setErrorPair] = useState<[number | null, number | null]>([null, null]);

  useEffect(() => {
    onChange({ ready: matchedL.size === q.pairs.length, correct: matchedL.size === q.pairs.length, auto: matchedL.size === q.pairs.length });
  }, [matchedL, q.pairs.length, onChange]);

  const resolve = (li: number, ri: number) => {
    const lVal = q.pairs[li].right;
    const rVal = q.rights[ri];
    if (lVal === rVal) {
      sfx.match();
      const nl = new Set(matchedL);
      nl.add(li);
      const nr = new Set(matchedR);
      nr.add(ri);
      setMatchedL(nl);
      setMatchedR(nr);
      setSelL(null);
      setSelR(null);
    } else {
      sfx.wrong();
      setErrorPair([li, ri]);
      setErrorKey((k) => k + 1);
      setTimeout(() => {
        setSelL(null);
        setSelR(null);
        setErrorPair([null, null]);
      }, 480);
    }
  };

  const clickL = (i: number) => {
    if (matchedL.has(i)) return;
    sfx.click();
    if (selL === i) return setSelL(null);
    setSelL(i);
    if (selR !== null) resolve(i, selR);
  };
  const clickR = (i: number) => {
    if (matchedR.has(i)) return;
    sfx.click();
    if (selR === i) return setSelR(null);
    setSelR(i);
    if (selL !== null) resolve(selL, i);
  };

  const cardStyle = (opts: { matched: boolean; selected: boolean; error: boolean }) => {
    if (opts.matched)
      return { borderColor: "#58A700", background: "#1E3312", color: "#89E219", boxShadow: "0 4px 0 #14260C" };
    if (opts.error) return { borderColor: "#C92A2A", background: "#331B1B", color: "#FF8A8A" };
    if (opts.selected) return { borderColor: "#35B2E2", background: "#173449", color: "#7CD4F2" };
    return { borderColor: "#2B3E4A", background: "#1B2B36", color: "#EAF4FB" };
  };

  const isErrorL = (i: number) => errorPair[0] === i;
  const isErrorR = (i: number) => errorPair[1] === i;

  return (
    <div className="w-full max-w-md mx-auto grid grid-cols-2 gap-4" key={errorKey}>
      <div className="flex flex-col gap-4">
        {q.pairs.map((p, i) => {
          const matched = matchedL.has(i);
          return (
            <motion.button
              key={i}
              onClick={() => clickL(i)}
              disabled={matched}
              className={`opt-card h-28 grid place-items-center font-display font-extrabold text-xl relative ${isErrorL(i) || (phase === "wrong" && !matched) ? "animate-shake" : ""}`}
              style={cardStyle({ matched, selected: selL === i, error: isErrorL(i) })}
            >
              <span className="inline-flex items-center gap-2">
                {p.left.split(" ").map((t, k) =>
                  t === "+" ? (
                    <span key={k} style={{ color: matched ? "#89E219" : OP_COLOR }}>
                      +
                    </span>
                  ) : (
                    <span key={k}>{t}</span>
                  ),
                )}
              </span>
              {matched && <Check size={18} className="absolute top-2 right-2 text-[#89E219]" />}
            </motion.button>
          );
        })}
      </div>
      <div className="flex flex-col gap-4">
        {q.rights.map((r, i) => {
          const matched = matchedR.has(i);
          return (
            <motion.button
              key={i}
              onClick={() => clickR(i)}
              disabled={matched}
              className={`opt-card h-28 grid place-items-center font-display font-extrabold text-2xl relative ${isErrorR(i) ? "animate-shake" : ""}`}
              style={cardStyle({ matched, selected: selR === i, error: isErrorR(i) })}
            >
              {r}
              {matched && <Check size={18} className="absolute top-2 right-2 text-[#89E219]" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
