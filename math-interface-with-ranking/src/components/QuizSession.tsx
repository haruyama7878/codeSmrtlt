import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Flame, X, XCircle, Zap } from "lucide-react";
import type { AnswerState, AnyQ, Phase } from "../lib/game";
import { generateSession, randomPraise, solutionText } from "../lib/game";
import { sfx } from "../lib/audio";
import { DuoButton, Hearts, ProgressBar } from "./ui";
import TypeAnswer from "../questions/TypeAnswer";
import CompleteEquation from "../questions/CompleteEquation";
import NumberLine from "../questions/NumberLine";
import MatchPairs from "../questions/MatchPairs";
import SelectAllMatch from "../questions/SelectAllMatch";

export interface SessionResult {
  xp: number;
  correct: number;
  total: number;
  bestStreak: number;
  finished: boolean;
}

interface Props {
  onFinish: (r: SessionResult) => void;
  onQuit: () => void;
}

const TOTAL_HEARTS = 3;
const XP_PER_QUESTION = 10;

export default function QuizSession({ onFinish, onQuit }: Props) {
  const [questions, setQuestions] = useState<AnyQ[]>(() => generateSession(10));
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("answer");
  const [ans, setAns] = useState<AnswerState>({ ready: false, correct: false });
  const [hearts, setHearts] = useState(TOTAL_HEARTS);
  const [xp, setXp] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [praise, setPraise] = useState("Chính xác!");
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [dead, setDead] = useState(false);

  const q = questions[idx];

  const results = useCallback(
    (finished: boolean): SessionResult => ({ xp, correct: correctCount, total: questions.length, bestStreak, finished }),
    [xp, correctCount, questions.length, bestStreak],
  );

  const doCheck = useCallback(() => {
    if (phase !== "answer" || !ans.ready) return;
    if (ans.correct) {
      sfx.correct();
      setPraise(randomPraise());
      setPhase("right");
      setXp((v) => v + XP_PER_QUESTION);
      setCorrectCount((v) => v + 1);
      setStreak((s) => {
        const n = s + 1;
        setBestStreak((b) => Math.max(b, n));
        return n;
      });
    } else {
      sfx.wrong();
      setPhase("wrong");
      setStreak(0);
      setHearts((h) => Math.max(0, h - 1));
    }
  }, [phase, ans]);

  // auto-check (match pairs)
  useEffect(() => {
    if (phase === "answer" && ans.ready && ans.auto) {
      const t = setTimeout(doCheck, 500);
      return () => clearTimeout(t);
    }
  }, [ans, phase, doCheck]);

  const goNext = useCallback(() => {
    if (phase === "wrong" && hearts <= 0) {
      setDead(true);
      return;
    }
    if (idx >= questions.length - 1) {
      onFinish(results(true));
      return;
    }
    setIdx((i) => i + 1);
    setPhase("answer");
    setAns({ ready: false, correct: false });
  }, [phase, hearts, idx, questions.length, onFinish, results]);

  // keyboard: Enter to check / continue
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || dead || confirmQuit) return;
      if (phase === "answer") doCheck();
      else goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [doCheck, goNext, phase, dead, confirmQuit]);

  const restart = () => {
    setQuestions(generateSession(10));
    setIdx(0);
    setPhase("answer");
    setAns({ ready: false, correct: false });
    setHearts(TOTAL_HEARTS);
    setXp(0);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setDead(false);
  };

  const progress = (idx + (phase !== "answer" ? 1 : 0)) / questions.length;

  return (
    <div className="min-h-dvh flex flex-col">
      {/* header */}
      <header className="w-full max-w-2xl mx-auto px-4 pt-5 flex items-center gap-3">
        <button
          onClick={() => setConfirmQuit(true)}
          className="text-[#4A6172] hover:text-[#7A93A3] transition-colors p-1"
          aria-label="Thoát"
        >
          <X size={26} strokeWidth={3} />
        </button>
        <ProgressBar value={progress} color={phase === "wrong" ? "#FF9600" : "#FFC800"} />
        <div className="flex items-center gap-1 font-display font-extrabold text-lg" style={{ color: streak >= 3 ? "#FF9600" : "#4A6172" }}>
          <Flame size={20} className={streak >= 3 ? "fill-[#FF9600] text-[#FF9600]" : ""} />
          {streak}
        </div>
        <Hearts n={hearts} />
      </header>

      {/* question */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-8 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ x: 48, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -48, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl mb-10 text-center sm:text-left">{q.prompt}</h2>
            <div className="flex-1 grid place-items-center">
              {q.kind === "type" && <TypeAnswer q={q} phase={phase} onChange={setAns} />}
              {q.kind === "build" && <CompleteEquation q={q} phase={phase} onChange={setAns} />}
              {q.kind === "line" && <NumberLine q={q} phase={phase} onChange={setAns} />}
              {q.kind === "match" && <MatchPairs q={q} phase={phase} onChange={setAns} />}
              {q.kind === "select" && <SelectAllMatch q={q} phase={phase} onChange={setAns} />}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* footer */}
      <footer className="w-full border-t-2 border-[#1B2B36] relative">
        <AnimatePresence mode="wait">
          {phase === "answer" && (
            <motion.div
              key="check"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-2xl mx-auto px-5 py-4 flex justify-end"
            >
              <DuoButton color="green" className="w-full sm:w-44" disabled={!ans.ready} onClick={doCheck}>
                Kiểm tra
              </DuoButton>
            </motion.div>
          )}

          {phase === "right" && (
            <motion.div
              key="right"
              initial={{ y: 90 }}
              animate={{ y: 0 }}
              exit={{ y: 90 }}
              transition={{ type: "spring", damping: 24, stiffness: 260 }}
              className="w-full bg-gradient-to-r from-[#12281B] via-[#142F1A] to-[#12281B] border-t-2 border-[#2B4B22]"
            >
              <div className="w-full max-w-2xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <CheckCircle2 size={40} className="text-[#89E219] shrink-0" strokeWidth={2.4} />
                  <div className="min-w-0">
                    <div className="font-display font-extrabold text-xl text-[#89E219] leading-tight">{praise}</div>
                    <div className="flex items-center gap-1 text-[#FFC800] font-display font-bold text-sm">
                      <Zap size={14} className="fill-[#FFC800]" /> +{XP_PER_QUESTION} XP
                    </div>
                  </div>
                </div>
                <DuoButton color="green" className="w-36 shrink-0" onClick={goNext}>
                  Tiếp tục
                </DuoButton>
              </div>
            </motion.div>
          )}

          {phase === "wrong" && (
            <motion.div
              key="wrong"
              initial={{ y: 90 }}
              animate={{ y: 0 }}
              exit={{ y: 90 }}
              transition={{ type: "spring", damping: 24, stiffness: 260 }}
              className="w-full bg-gradient-to-r from-[#2B1418] via-[#331418] to-[#2B1418] border-t-2 border-[#5C2027]"
            >
              <div className="w-full max-w-2xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <XCircle size={40} className="text-[#FF5B6E] shrink-0" strokeWidth={2.4} />
                  <div className="min-w-0">
                    <div className="font-display font-extrabold text-xl text-[#FF5B6E] leading-tight">Chưa chính xác</div>
                    <div className="text-[#D98A93] text-sm font-bold truncate">
                      Đáp án đúng: <span className="font-display">{solutionText(q)}</span>
                    </div>
                  </div>
                </div>
                <DuoButton color="red" className="w-36 shrink-0" onClick={goNext}>
                  Tiếp tục
                </DuoButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>

      {/* quit confirm */}
      <AnimatePresence>
        {confirmQuit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm grid place-items-center px-6"
            onClick={() => setConfirmQuit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border-2 border-[#2B3E4A] bg-[#16242E] p-6 text-center"
            >
              <div className="font-display font-extrabold text-2xl mb-2">Thoát phiên luyện tập?</div>
              <p className="text-[#7A93A3] font-bold mb-6">Tiến trình của phiên này sẽ không được lưu.</p>
              <div className="flex gap-3">
                <DuoButton color="ghost" className="flex-1" onClick={() => setConfirmQuit(false)}>
                  Ở lại
                </DuoButton>
                <DuoButton color="red" className="flex-1" onClick={onQuit}>
                  Thoát
                </DuoButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* out of hearts */}
      <AnimatePresence>
        {dead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm grid place-items-center px-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-full max-w-sm rounded-3xl border-2 border-[#2B3E4A] bg-[#16242E] p-6 text-center"
            >
              <img src="/mascot.png" alt="Mascot MathQuest" className="w-36 h-36 object-cover rounded-full mx-auto mb-4 border-4 border-[#2B3E4A]" />
              <div className="font-display font-extrabold text-2xl mb-2 text-[#FF5B6E]">Hết trái tim rồi!</div>
              <p className="text-[#7A93A3] font-bold mb-6">
                Đừng nản — bạn vẫn giữ được <span className="text-[#FFC800] font-display">{xp} XP</span> đã kiếm trong phiên này.
              </p>
              <div className="flex flex-col gap-3">
                <DuoButton color="blue" onClick={restart}>
                  Chơi lại từ đầu
                </DuoButton>
                <DuoButton color="ghost" onClick={() => onFinish(results(false))}>
                  Kết thúc & nhận XP
                </DuoButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
