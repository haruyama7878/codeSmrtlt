import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Crown, ShieldAlert, Sparkles, Timer, TrendingUp } from "lucide-react";
import type { Row } from "../lib/game";
import { DIAMOND_LADDER, RANKS, diamondPosition, getLeague, isProdigy, rankIndexForXp } from "../lib/game";
import { Avatar } from "./ui";

interface Props {
  totalXp: number;
  weeklyXp: number;
  onBack: () => void;
}

function weekCountdown(): string {
  const day = (new Date().getDay() + 6) % 7; // 0 = Monday
  const left = 6 - day;
  if (left === 0) return "hôm nay";
  return `${left} ngày`;
}

function RankNumber({ n }: { n: number }) {
  const colors: Record<number, string> = { 1: "#FFC53D", 2: "#C4D2DE", 3: "#D08A4E" };
  const c = colors[n];
  return (
    <span
      className="w-8 text-center font-display font-extrabold text-lg shrink-0"
      style={c ? { color: c } : { color: "#5F7A8C" }}
    >
      {n}
    </span>
  );
}

function ZoneDivider({ label, color, icon }: { label: string; color: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="h-px flex-1" style={{ background: `${color}55` }} />
      <span className="flex items-center gap-1.5 font-display font-extrabold text-[11px] uppercase tracking-widest" style={{ color }}>
        {icon}
        {label}
      </span>
      <div className="h-px flex-1" style={{ background: `${color}55` }} />
    </div>
  );
}

export default function LeagueScreen({ totalXp, weeklyXp, onBack }: Props) {
  const myRankIdx = rankIndexForXp(totalXp);
  const myLeagueId = RANKS[myRankIdx].id;
  const [tab, setTab] = useState<string>(myLeagueId);
  const prodigy = isProdigy(totalXp, weeklyXp);

  const league = useMemo(
    () => (tab === "prodigy" ? null : getLeague(tab, weeklyXp, tab === myLeagueId)),
    [tab, weeklyXp, myLeagueId],
  );

  // Prodigy hall = top 100 of diamond ladder (+ you if qualified and missing)
  const prodigyRows = useMemo<Row[]>(() => {
    const top = DIAMOND_LADDER.slice(0, 100).map((r) => ({ ...r }));
    if (diamondPosition(weeklyXp) <= 100) {
      top.push({ name: "Bạn", xp: weeklyXp, hue: 205, you: true });
      top.sort((a, b) => b.xp - a.xp);
    }
    return top;
  }, [weeklyXp]);

  const def = RANKS.find((r) => r.id === tab) ?? RANKS[0];

  return (
    <div className="min-h-dvh w-full max-w-xl mx-auto px-5 pb-14">
      <header className="pt-5 flex items-center gap-3">
        <button onClick={onBack} className="text-[#4A6172] hover:text-[#7A93A3] transition-colors p-1" aria-label="Quay lại">
          <ArrowLeft size={26} strokeWidth={3} />
        </button>
        <h1 className="font-display font-extrabold text-2xl flex-1">Bảng xếp hạng</h1>
        <div className="flex items-center gap-1.5 text-[#7A93A3] font-bold text-sm">
          <Timer size={16} />
          Kết thúc sau {weekCountdown()}
        </div>
      </header>

      {/* tier tabs */}
      <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {RANKS.map((r, i) => {
          const active = tab === r.id;
          const isProdigyTab = i === 5;
          return (
            <button
              key={r.id}
              onClick={() => setTab(r.id)}
              className="flex flex-col items-center gap-1 shrink-0 rounded-2xl px-3 py-2 border-2 transition-all"
              style={{
                borderColor: active ? r.color : "transparent",
                background: active ? `${r.color}14` : "transparent",
              }}
            >
              <img
                src={r.img}
                alt={r.full}
                className="w-12 h-12 object-cover rounded-full border-2"
                style={{
                  borderColor: active ? r.color : "#22333F",
                  filter: isProdigyTab && !prodigy ? "saturate(0.9)" : "none",
                  boxShadow: active ? `0 0 16px ${r.color}55` : "none",
                }}
              />
              <span
                className="font-display font-extrabold text-[11px]"
                style={{ color: active ? r.color : "#5F7A8C" }}
              >
                {r.short}
              </span>
            </button>
          );
        })}
      </div>

      {/* tier banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
        >
          <div className="mt-4 rounded-3xl border-2 bg-gradient-to-br from-[#14222C] to-[#101B24] p-5 flex items-center gap-4" style={{ borderColor: `${def.color}44` }}>
            <motion.img
              src={def.img}
              alt={def.full}
              className="w-24 h-24 object-cover rounded-full border-[3px]"
              style={{ borderColor: def.color, boxShadow: `0 0 34px ${def.color}66` }}
              initial={{ scale: 0.7, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 14 }}
            />
            <div className="flex-1">
              <div className="font-display font-extrabold text-2xl" style={{ color: def.color }}>
                {tab === "prodigy" ? <span className="text-shimmer">Điện danh Thần Đồng</span> : def.full}
              </div>
              <p className="text-[#7A93A3] font-bold text-sm mt-1">{def.rule}</p>
              {tab === myLeagueId && !prodigy && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-display font-extrabold uppercase tracking-wider" style={{ background: `${def.color}22`, color: def.color }}>
                  Giải hiện tại của bạn
                </div>
              )}
              {tab === myLeagueId && prodigy && myLeagueId === "diamond" && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-display font-extrabold uppercase tracking-wider bg-[#C58BFF]/20 text-[#C58BFF]">
                  <Crown size={12} /> Bạn đang là Thần Đồng
                </div>
              )}
            </div>
          </div>

          {/* leaderboard */}
          <div className="mt-4 rounded-3xl border-2 border-[#22333F] bg-[#101D27] overflow-hidden">
            <div className="max-h-[52vh] overflow-y-auto nice-scroll">
              {tab !== "prodigy" && league && (
                <>
                  {league.rows.map((r, i) => (
                    <div key={`${r.name}-${i}`}>
                      {i === league.promo && <ZoneDivider label={tab === "diamond" ? "Top 100 → Thần Đồng" : "Thăng hạng"} color="#89E219" icon={<TrendingUp size={13} />} />}
                      {league.demo > 0 && i === league.rows.length - league.demo && (
                        <ZoneDivider label="Xuống hạng" color="#FF5B6E" icon={<ShieldAlert size={13} />} />
                      )}
                      <div
                        className="flex items-center gap-3 px-4 py-2.5 border-b border-[#16242E]"
                        style={r.you ? { background: "#173449", boxShadow: "inset 3px 0 0 #35B2E2" } : undefined}
                      >
                        <RankNumber n={i + 1} />
                        <Avatar name={r.name} hue={r.hue} />
                        <span className={`flex-1 truncate font-bold ${r.you ? "text-[#7CD4F2] font-extrabold" : "text-[#C9DAE5]"}`}>
                          {r.name}
                          {r.you && <span className="ml-2 text-[10px] font-display font-extrabold uppercase tracking-wider text-[#35B2E2] border border-[#35B2E2]/40 rounded-full px-2 py-0.5">Bạn</span>}
                        </span>
                        <span className="font-display font-extrabold text-[#7A93A3] text-sm whitespace-nowrap">{r.xp} XP</span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {tab === "prodigy" && (
                <>
                  {prodigyRows.map((r, i) => (
                    <div
                      key={`${r.name}-${i}`}
                      className="flex items-center gap-3 px-4 py-2.5 border-b border-[#16242E]"
                      style={r.you ? { background: "#173449", boxShadow: "inset 3px 0 0 #C58BFF" } : undefined}
                    >
                      <RankNumber n={i + 1} />
                      <Avatar name={r.name} hue={r.hue} />
                      <span className={`flex-1 truncate font-bold ${r.you ? "text-[#C58BFF] font-extrabold" : "text-[#C9DAE5]"}`}>
                        {r.name}
                        {r.you && <span className="ml-2 text-[10px] font-display font-extrabold uppercase tracking-wider text-[#C58BFF] border border-[#C58BFF]/40 rounded-full px-2 py-0.5">Bạn</span>}
                      </span>
                      <img src="/ranks/prodigy.png" alt="Thần Đồng" className="w-7 h-7 object-cover rounded-full" />
                      <span className="font-display font-extrabold text-[#7A93A3] text-sm whitespace-nowrap">{r.xp} XP</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            {tab === "prodigy" && !prodigy && myLeagueId !== "prodigy" && (
              <div className="px-5 py-4 border-t-2 border-[#22333F] flex items-center gap-3">
                <Sparkles size={18} className="text-[#C58BFF] shrink-0" />
                <p className="text-sm font-bold text-[#7A93A3]">
                  {myLeagueId === "diamond"
                    ? `Bạn đang đứng hạng #${diamondPosition(weeklyXp)} của giải Kim Cương — lọt Top 100 để được phong Thần Đồng!`
                    : "Hãy thăng lên giải Kim Cương và lọt Top 100 để trở thành Thần Đồng!"}
                </p>
              </div>
            )}
          </div>

          {/* your position summary */}
          {tab !== "prodigy" && league && league.youIndex >= 0 && (
            <div className="mt-3 text-center font-display font-bold text-[#5F7A8C] text-sm">
              Vị trí của bạn: <span className="text-[#7CD4F2] font-extrabold">#{league.youIndex + 1}</span>
              {tab === "diamond"
                ? league.youIndex < 100
                  ? " — Bạn nằm trong Top 100 Thần Đồng!"
                  : ` — còn ${league.youIndex + 1 - 100} bậc nữa tới Thần Đồng`
                : league.youIndex < league.promo
                  ? " — trong khu vực thăng hạng!"
                  : league.youIndex >= league.rows.length - league.demo
                    ? " — cẩn thận, bạn đang ở khu vực xuống hạng!"
                    : ""}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
