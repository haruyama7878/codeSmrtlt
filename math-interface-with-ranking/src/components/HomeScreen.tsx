import { useMemo } from "react";
import { motion } from "framer-motion";
import { Blocks, ChevronRight, Flame, Link2, ListChecks, PenLine, Ruler, Sparkles, Trophy, Zap } from "lucide-react";
import { RANKS, isProdigy, rankIndexForXp } from "../lib/game";
import { Chip, DuoButton, ProgressBar } from "./ui";

interface Props {
  totalXp: number;
  weeklyXp: number;
  sessions: number;
  onPlay: () => void;
  onLeague: () => void;
}

const SYMBOLS = ["+", "−", "×", "÷", "=", "√", "π", "%", "∑", "∞"];

function FloatSymbols() {
  const items = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        s: SYMBOLS[i % SYMBOLS.length],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 28 + Math.random() * 64,
        dur: 5 + Math.random() * 6,
        delay: Math.random() * 4,
      })),
    [],
  );
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {items.map((it, i) => (
        <motion.span
          key={i}
          className="absolute font-display font-extrabold text-white/[0.045] select-none"
          style={{ left: `${it.x}%`, top: `${it.y}%`, fontSize: it.size }}
          animate={{ y: [0, -18, 0], rotate: [0, 6, -6, 0] }}
          transition={{ duration: it.dur, delay: it.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {it.s}
        </motion.span>
      ))}
    </div>
  );
}

const QUESTION_TYPES = [
  { icon: Blocks, label: "Ghép phép tính" },
  { icon: PenLine, label: "Nhập đáp án" },
  { icon: Ruler, label: "Trục số" },
  { icon: Link2, label: "Nối cặp" },
  { icon: ListChecks, label: "Chọn tất cả" },
];

export default function HomeScreen({ totalXp, weeklyXp, sessions, onPlay, onLeague }: Props) {
  const rankIdx = rankIndexForXp(totalXp);
  const prodigy = isProdigy(totalXp, weeklyXp);
  const rank = prodigy ? RANKS[5] : RANKS[rankIdx];
  const next = RANKS[rankIdx + 1];
  const bandProgress = next && next.min !== Infinity ? (totalXp - rank.min) / (next.min - rank.min) : 1;

  return (
    <div className="min-h-dvh relative">
      <FloatSymbols />

      <div className="relative w-full max-w-xl mx-auto px-5 pb-16">
        {/* top bar */}
        <header className="pt-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl grid place-items-center font-display font-extrabold text-xl text-[#04222F]" style={{ background: "linear-gradient(135deg,#6ED3F5,#1D82AC)", boxShadow: "0 4px 0 #155E7D" }}>
              π
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight">
              Math<span className="text-[#35B2E2]">Quest</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Chip icon={<Flame size={17} className="fill-[#FF9600] text-[#FF9600]" />} label={String(sessions)} color="#FF9600" />
            <Chip icon={<Zap size={17} className="fill-[#FFC800] text-[#FFC800]" />} label={String(totalXp)} color="#FFC800" />
          </div>
        </header>

        {/* hero */}
        <div className="mt-10 text-center">
          <motion.img
            src="/mascot.png"
            alt="Mascot MathQuest"
            className="w-40 h-40 object-cover rounded-full mx-auto border-4 border-[#1D3A4C]"
            style={{ boxShadow: "0 0 60px rgba(53,178,226,0.25)" }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <h1 className="mt-6 font-display font-extrabold text-4xl sm:text-5xl leading-[1.12] tracking-tight">
            Chinh phục từng
            <br />
            <span className="text-[#35B2E2]">con số.</span> Leo tới <span className="text-shimmer">Thần Đồng.</span>
          </h1>
          <p className="mt-3 text-[#7A93A3] font-bold text-lg max-w-md mx-auto">
            5 dạng bài tập siêu vui, mỗi phiên 2 phút. Tích XP, thăng hạng từ giải Đồng lên ngôi vị cao nhất.
          </p>
          <DuoButton color="green" className="mt-7 w-full sm:w-auto sm:px-12 py-4 text-lg" onClick={onPlay}>
            Bắt đầu luyện tập
          </DuoButton>
        </div>

        {/* current rank card */}
        <motion.button
          onClick={onLeague}
          whileTap={{ scale: 0.98 }}
          className="mt-10 w-full text-left rounded-3xl border-2 border-[#2B3E4A] bg-[#14222C] p-5 flex items-center gap-4 hover:border-[#3A5262] transition-colors"
          style={{ boxShadow: "0 6px 0 rgba(0,0,0,0.25)" }}
        >
          <motion.img
            src={rank.img}
            alt={rank.full}
            className="w-20 h-20 object-cover rounded-full border-2 shrink-0"
            style={{ borderColor: rank.color, boxShadow: `0 0 24px ${rank.color}55` }}
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-xl" style={{ color: rank.color }}>
                {rank.full}
              </span>
              {prodigy && <Sparkles size={17} className="text-[#C58BFF]" />}
            </div>
            {next && next.min !== Infinity ? (
              <>
                <div className="mt-2 flex items-center gap-2">
                  <ProgressBar value={Math.min(1, Math.max(0, bandProgress))} color={next.color} />
                </div>
                <div className="mt-1.5 text-sm font-bold text-[#7A93A3]">
                  {totalXp} / {next.min} XP để lên <span style={{ color: next.color }}>{rankIdx + 1 === 5 ? "" : `giải ${next.short}`}</span>
                </div>
              </>
            ) : (
              <div className="mt-1.5 text-sm font-bold text-[#7A93A3]">Giải đấu cao nhất — Lọt Top 100 để thành Thần Đồng!</div>
            )}
          </div>
          <ChevronRight className="text-[#4A6172] shrink-0" size={26} />
        </motion.button>

        {/* rank ladder */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={19} className="text-[#FFC800]" />
            <h2 className="font-display font-extrabold text-xl">Hành trình danh hiệu</h2>
          </div>
          <div className="rounded-3xl border-2 border-[#2B3E4A] bg-[#101D27] p-4 overflow-x-auto no-scrollbar">
            <div className="flex items-end min-w-[560px]">
              {RANKS.map((r, i) => {
                const reached = prodigy ? true : i <= rankIdx;
                const isCurrent = prodigy ? i === 5 : i === rankIdx;
                return (
                  <div key={r.id} className="flex items-end flex-1 last:flex-none last:w-[86px]">
                    <div className="flex flex-col items-center gap-1.5 w-[86px]">
                      <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 * i, type: "spring", damping: 18 }}
                        className="relative"
                      >
                        <img
                          src={r.img}
                          alt={r.full}
                          className={`object-cover rounded-full border-2 ${isCurrent ? "w-16 h-16" : "w-12 h-12"}`}
                          style={{
                            borderColor: isCurrent ? r.color : "#2B3E4A",
                            filter: reached ? "none" : "grayscale(0.9) brightness(0.55)",
                            boxShadow: isCurrent ? `0 0 22px ${r.color}66` : "none",
                          }}
                        />
                        {isCurrent && (
                          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-display font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: r.color, color: "#0D1821" }}>
                            Bạn
                          </span>
                        )}
                      </motion.div>
                      <span className={`font-display font-extrabold text-xs mt-1 ${isCurrent ? "" : "text-[#5F7A8C]"}`} style={isCurrent ? { color: r.color } : undefined}>
                        {r.short}
                      </span>
                      <span className="text-[10px] font-bold text-[#41596B]">
                        {r.min === Infinity ? "Top 100 KC" : `${r.min} XP`}
                      </span>
                    </div>
                    {i < RANKS.length - 1 && (
                      <div className="flex-1 h-[3px] rounded mx-1 mb-[52px]" style={{ background: i < rankIdx || prodigy ? RANKS[i + 1].color : "#22333F" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* question types */}
        <div className="mt-10">
          <h2 className="font-display font-extrabold text-xl mb-4">5 dạng bài trong mỗi phiên</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUESTION_TYPES.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-2xl border-2 border-[#2B3E4A] bg-[#14222C] px-4 py-3.5 flex items-center gap-3"
              >
                <t.icon size={20} className="text-[#35B2E2] shrink-0" />
                <span className="font-display font-bold text-sm">{t.label}</span>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border-2 border-dashed border-[#2B3E4A] px-4 py-3.5 flex items-center gap-3"
            >
              <Sparkles size={20} className="text-[#C58BFF] shrink-0" />
              <span className="font-display font-bold text-sm text-[#7A93A3]">+3 tim mỗi phiên</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
