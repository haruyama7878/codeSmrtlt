import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCheck, Crown, Flame, Sparkles, Target, Zap } from "lucide-react";
import type { SessionResult } from "./QuizSession";
import { RANKS, diamondPosition, isProdigy, rankIndexForXp } from "../lib/game";
import { sfx } from "../lib/audio";
import { DuoButton, ProgressBar } from "./ui";

export interface ResultData extends SessionResult {
  xpBefore: number;
  xpAfter: number;
  weeklyAfter: number;
}

interface Props {
  result: ResultData;
  onHome: () => void;
  onReplay: () => void;
}

function CountUp({ to, duration = 1.2 }: { to: number; duration?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <>{v}</>;
}

function StatCard({ icon, label, value, color, delay }: { icon: ReactNode; label: string; value: ReactNode; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", damping: 18 }}
      className="rounded-2xl border-2 p-4 flex flex-col gap-1.5"
      style={{ borderColor: `${color}55`, background: "#14222C" }}
    >
      <span className="flex items-center gap-1.5 text-[11px] font-display font-extrabold uppercase tracking-widest" style={{ color }}>
        {icon}
        {label}
      </span>
      <span className="font-display font-extrabold text-3xl">{value}</span>
    </motion.div>
  );
}

export default function ResultScreen({ result, onHome, onReplay }: Props) {
  const idxBefore = rankIndexForXp(result.xpBefore);
  const idxAfter = rankIndexForXp(result.xpAfter);
  const rankedUp = idxAfter > idxBefore;
  const weeklyBefore = result.weeklyAfter - result.xp;
  const prodigy = isProdigy(result.xpAfter, result.weeklyAfter);
  const wasProdigy = isProdigy(result.xpBefore, weeklyBefore);
  const becameProdigy = prodigy && !wasProdigy;

  const displayRank = prodigy ? RANKS[5] : RANKS[idxAfter];
  const next = RANKS[idxAfter + 1];
  const nextHasXp = next && next.min !== Infinity;
  const pctBefore = nextHasXp ? Math.min(1, Math.max(0, (result.xpBefore - RANKS[idxAfter].min) / (next.min - RANKS[idxAfter].min))) : 1;
  const pctAfter = nextHasXp ? Math.min(1, Math.max(0, (result.xpAfter - RANKS[idxAfter].min) / (next.min - RANKS[idxAfter].min))) : 1;

  const accuracy = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;

  useEffect(() => {
    const colors = ["#89E219", "#35B2E2", "#FFC800", "#C58BFF", "#FF5B6E"];
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.65 }, colors, disableForReducedMotion: true });
    const t1 = setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors, disableForReducedMotion: true }), 350);
    const t2 = setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors, disableForReducedMotion: true }), 550);
    if (rankedUp || becameProdigy) {
      const t3 = setTimeout(() => sfx.levelup(), 500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [rankedUp, becameProdigy]);

  return (
    <div className="min-h-dvh w-full max-w-xl mx-auto px-5 py-10 flex flex-col items-center justify-center text-center">
      {/* badge */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 11, stiffness: 180 }}
        className="relative"
      >
        <div
          className="absolute -inset-6 rounded-full blur-2xl opacity-60"
          style={{ background: `radial-gradient(circle, ${displayRank.color}55, transparent 70%)` }}
        />
        <img
          src={displayRank.img}
          alt={displayRank.full}
          className="relative w-40 h-40 object-cover rounded-full border-4"
          style={{ borderColor: displayRank.color, boxShadow: `0 0 50px ${displayRank.color}77` }}
        />
        {(rankedUp || becameProdigy) && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full px-3 py-1 font-display font-extrabold text-xs uppercase tracking-wider whitespace-nowrap"
            style={{ background: displayRank.color, color: "#0D1821" }}
          >
            {becameProdigy ? <Crown size={13} /> : <Sparkles size={13} />}
            {becameProdigy ? "Danh hiệu mới" : "Thăng hạng"}
          </motion.div>
        )}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-8 font-display font-extrabold text-4xl sm:text-5xl tracking-tight"
      >
        {becameProdigy ? (
          <span className="text-shimmer">THẦN ĐỒNG MỚI!</span>
        ) : rankedUp ? (
          <>
            THĂNG HẠNG{" "}
            <span style={{ color: displayRank.color }}>{displayRank.short.toUpperCase()}!</span>
          </>
        ) : (
          "Hoàn thành buổi luyện!"
        )}
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-2 text-[#7A93A3] font-bold">
        {becameProdigy
          ? `Bạn đứng hạng #${diamondPosition(result.weeklyAfter)} giải Kim Cương — chính thức lọt Top 100 Thần Đồng.`
          : rankedUp
            ? `Chào mừng bạn đến với ${displayRank.full}.`
            : result.finished
              ? "Làm tốt lắm! Luyện thêm một phiên nữa để giữ phong độ nhé."
              : "Bạn đã giữ lại toàn bộ XP của phiên này."}
      </motion.p>

      {/* stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-md">
        <StatCard icon={<Zap size={14} />} label="Tổng XP" color="#FFC800" delay={0.25} value={<CountUp to={result.xp} />} />
        <StatCard icon={<CheckCheck size={14} />} label="Câu đúng" color="#89E219" delay={0.35} value={`${result.correct}/${result.total}`} />
        <StatCard icon={<Target size={14} />} label="Chính xác" color="#35B2E2" delay={0.45} value={`${accuracy}%`} />
        <StatCard icon={<Flame size={14} />} label="Chuỗi dài nhất" color="#FF9600" delay={0.55} value={result.bestStreak} />
      </div>

      {/* progress to next rank */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="mt-8 w-full max-w-md rounded-3xl border-2 border-[#2B3E4A] bg-[#101D27] p-5 text-left"
      >
        {nextHasXp ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <img src={next.img} alt={next.full} className="w-10 h-10 object-cover rounded-full border-2" style={{ borderColor: next.color }} />
              <div className="font-display font-bold text-[#7A93A3]">
                Tiến tới <span style={{ color: next.color }}>{next.full}</span>
              </div>
              <div className="ml-auto font-display font-extrabold text-sm text-[#7A93A3]">
                {result.xpAfter}/{next.min} XP
              </div>
            </div>
            <div className="relative">
              <ProgressBar value={pctBefore} color={next.color} />
              <motion.div
                className="absolute inset-0 h-4 rounded-full overflow-hidden"
                initial={{ clipPath: `inset(0 ${100 - pctBefore * 100}% 0 0)` }}
                animate={{ clipPath: `inset(0 ${100 - pctAfter * 100}% 0 0)` }}
                transition={{ delay: 0.9, duration: 1, ease: "easeInOut" }}
              >
                <div className="h-full w-full rounded-full" style={{ background: next.color }}>
                  <div className="absolute inset-x-3 top-[3px] h-[5px] rounded-full bg-white/25" />
                </div>
              </motion.div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <img src="/ranks/prodigy.png" alt="Thần Đồng" className="w-10 h-10 object-cover rounded-full border-2 border-[#C58BFF]" />
            <div className="font-display font-bold text-[#7A93A3] flex-1">
              {prodigy ? (
                <span className="text-[#C58BFF]">Bạn đang giữ danh hiệu Thần Đồng tuần này!</span>
              ) : (
                <>
                  Vị trí giải Kim Cương: <span className="text-[#57A9FF] font-extrabold">#{diamondPosition(result.weeklyAfter)}</span> — lọt Top 100 để thành Thần Đồng
                </>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* actions */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 w-full max-w-md flex flex-col sm:flex-row gap-3"
      >
        <DuoButton color="ghost" className="flex-1" onClick={onReplay}>
          Chơi lại
        </DuoButton>
        <DuoButton color="green" className="flex-1" onClick={onHome}>
          Tiếp tục
        </DuoButton>
      </motion.div>
    </div>
  );
}
