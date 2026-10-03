import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HomeScreen from "./components/HomeScreen";
import QuizSession, { type SessionResult } from "./components/QuizSession";
import ResultScreen, { type ResultData } from "./components/ResultScreen";
import LeagueScreen from "./components/LeagueScreen";

type Screen = "home" | "quiz" | "result" | "league";

function useLocalNumber(key: string, init: number): [number, (v: number) => void] {
  const [val, setVal] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(key);
      const n = raw === null ? NaN : Number(raw);
      return Number.isFinite(n) ? n : init;
    } catch {
      return init;
    }
  });
  const set = (v: number) => {
    setVal(v);
    try {
      localStorage.setItem(key, String(v));
    } catch {
      /* ignore */
    }
  };
  return [val, set];
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [totalXp, setTotalXp] = useLocalNumber("mq_total_xp", 0);
  const [weeklyXp, setWeeklyXp] = useLocalNumber("mq_weekly_xp", 0);
  const [sessions, setSessions] = useLocalNumber("mq_sessions", 0);
  const [result, setResult] = useState<ResultData | null>(null);

  const handleFinish = (r: SessionResult) => {
    const data: ResultData = {
      ...r,
      xpBefore: totalXp,
      xpAfter: totalXp + r.xp,
      weeklyAfter: weeklyXp + r.xp,
    };
    setTotalXp(totalXp + r.xp);
    setWeeklyXp(weeklyXp + r.xp);
    setSessions(sessions + 1);
    setResult(data);
    setScreen("result");
  };

  return (
    <div className="min-h-dvh text-[#EAF4FB]">
      <AnimatePresence mode="wait">
        {screen === "home" && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            <HomeScreen totalXp={totalXp} weeklyXp={weeklyXp} sessions={sessions} onPlay={() => setScreen("quiz")} onLeague={() => setScreen("league")} />
          </motion.div>
        )}

        {screen === "quiz" && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            <QuizSession onFinish={handleFinish} onQuit={() => setScreen("home")} />
          </motion.div>
        )}

        {screen === "result" && result && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            <ResultScreen result={result} onHome={() => setScreen("home")} onReplay={() => setScreen("quiz")} />
          </motion.div>
        )}

        {screen === "league" && (
          <motion.div key="league" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            <LeagueScreen totalXp={totalXp} weeklyXp={weeklyXp} onBack={() => setScreen("home")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
