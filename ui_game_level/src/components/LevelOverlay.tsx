import { useEffect, useMemo, useState } from "react";
import type { Level } from "../lib/map";
import { Chest, Lotus, StarIcon } from "./art";

type Phase = "intro" | "loading" | "result";

const CHAPTER_THEME = [
  { from: "#7fd8f7", to: "#bde86a", btn: "#58cc02", btnDark: "#46a302" },
  { from: "#ffcf8b", to: "#ffb066", btn: "#ff9600", btnDark: "#e08600" },
  { from: "#8f8bf0", to: "#5f5bc9", btn: "#ce82ff", btnDark: "#a855f7" },
];

function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        left: (i * 37) % 100,
        delay: ((i * 13) % 20) / 10,
        dur: 2.4 + ((i * 7) % 18) / 10,
        color: ["#ffd166", "#06d6a0", "#118ab2", "#ef476f", "#fff"][i % 5],
        size: 6 + (i % 4) * 3,
        round: i % 3 === 0,
      })),
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((b, i) => (
        <span
          key={i}
          className="anim-confetti absolute top-0 block"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size * 1.6,
            background: b.color,
            borderRadius: b.round ? "999px" : "2px",
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

export function LevelOverlay({
  level,
  streak,
  hard,
  onComplete,
  onClose,
}: {
  level: Level;
  streak: number;
  hard?: boolean;
  onComplete: (stars: number, hard: boolean) => void;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [earned, setEarned] = useState(3);
  const th = CHAPTER_THEME[level.chapter];

  useEffect(() => {
    if (phase !== "loading") return;
    const t = setTimeout(() => {
      const s = 2 + ((level.n * 7) % 2);
      setEarned(s);
      setPhase("result");
    }, 1600);
    return () => clearTimeout(t);
  }, [phase, level.n]);

  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center px-5">
      <div
        className="anim-fade absolute inset-0 bg-[#0b2e12]/70 backdrop-blur-sm"
        onClick={phase === "intro" ? onClose : undefined}
      />

      {phase === "intro" && (
        <div className="anim-pop relative w-full max-w-[340px] overflow-hidden rounded-[30px] border-[5px] border-white/70 bg-white shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
          {/* header */}
          <div
            className="relative px-5 pb-8 pt-6 text-center"
            style={{ background: `linear-gradient(160deg, ${th.from}, ${th.to})` }}
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/25 text-lg font-black text-white active:scale-90"
            >
              ✕
            </button>
            <div className="mx-auto mb-2 w-fit rounded-2xl border-[3px] border-black/15 bg-white/90 px-4 py-1 text-[13px] font-extrabold uppercase tracking-wide text-slate-600">
              Chương {level.chapter + 1}
            </div>
            {hard && (
              <div className="mx-auto mb-2 w-fit rounded-2xl border-[3px] border-black/15 bg-gradient-to-r from-orange-400 to-rose-500 px-4 py-1 text-[13px] font-extrabold uppercase tracking-wide text-white shadow">
                🔥 Chế độ khó
              </div>
            )}
            <div className="stroke-brown flex h-16 items-center justify-center text-[54px] font-extrabold leading-none text-white">
              {level.type === "boss" ? (
                "👑"
              ) : level.type === "chest" ? (
                "🎁"
              ) : (
                <Lotus className="h-[64px] w-[74px] drop-shadow-lg" />
              )}
            </div>
            <div className="stroke-brown mt-1 text-[30px] font-extrabold text-white">
              Bài {level.n}
            </div>
            <div className="absolute inset-x-0 -bottom-6 flex justify-center">
              <div className="flex items-center gap-1 rounded-full border-[3px] border-amber-700/70 bg-amber-300 px-4 py-1 shadow-lg">
                {[0, 1, 2].map((i) => (
                  <StarIcon
                    key={i}
                    className={`h-6 w-6 ${i < 3 ? "text-amber-50" : "text-amber-700/40"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* body */}
          <div className="px-5 pb-5 pt-9">
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{level.goalIcon}</span>
                <div className="leading-tight">
                  <div className="text-[16px] font-extrabold text-slate-700">{level.goal}</div>
                  <div className="text-[12px] font-bold text-slate-400">Mục tiêu bài {level.n}</div>
                </div>
              </div>
              <span className="rounded-lg bg-emerald-100 px-2 py-1 text-[13px] font-extrabold text-emerald-700">
                {10 + level.n * 2}
              </span>
            </div>

            <div className="mb-4 flex items-center justify-center gap-5 text-[14px] font-extrabold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="text-base">🔥</span> Chuỗi {streak}
              </span>
              <span className="flex items-center gap-1">⏱️ {hard ? Math.max(3, level.moves - 5) : level.moves} nước</span>
              <span className="flex items-center gap-1">💎 +{hard ? level.reward * 2 : level.reward}</span>
            </div>

            <button
              onClick={() => setPhase("loading")}
              className="anim-shine relative w-full overflow-hidden rounded-2xl py-3.5 text-[22px] font-extrabold uppercase tracking-wide text-white shadow-[0_5px_0_var(--tw-shadow-color)] transition-transform active:translate-y-[3px] active:shadow-none"
              style={{
                background: th.btn,
                boxShadow: `0 5px 0 ${th.btnDark}`,
                ["--tw-shadow-color" as string]: th.btnDark,
              }}
            >
              Làm
            </button>

            <button
              onClick={onClose}
              className="mt-2 w-full rounded-2xl border-2 border-slate-200 py-2.5 text-[15px] font-extrabold uppercase tracking-wide text-slate-400 active:translate-y-[2px]"
            >
              Quay lại
            </button>
          </div>
        </div>
      )}

      {phase === "loading" && (
        <div className="anim-fade relative w-full max-w-[340px] overflow-hidden rounded-[28px] border-[5px] border-white/60 p-6 text-center shadow-2xl"
          style={{ background: `linear-gradient(170deg, ${th.from}, ${th.to})` }}
        >
          <div className="anim-bob mx-auto mb-3 w-fit text-[64px]">🎮</div>
          <div className="stroke-brown text-[24px] font-extrabold text-white">
            Đang vào bài {level.n}…
          </div>
          <div className="mt-4 h-4 w-full overflow-hidden rounded-full border-2 border-black/20 bg-black/20">
            <div className="anim-bar h-full rounded-full bg-gradient-to-r from-lime-300 to-emerald-500" />
          </div>
          <div className="mt-2 text-[13px] font-bold text-white/80">Ghép 3 cùng loại để thắng!</div>
        </div>
      )}

      {phase === "result" && (
        <div className="relative w-full max-w-[340px]">
          <Confetti />
          <div className="anim-pop relative overflow-hidden rounded-[30px] border-[5px] border-white/70 bg-gradient-to-b from-sky-50 to-white px-5 pb-5 pt-7 text-center shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
            <div className="stroke-dark text-[34px] font-extrabold text-amber-400">TUYỆT VỜI!</div>
            <div className="mt-1 text-[15px] font-extrabold text-slate-500">
              {hard ? "Bạn đã vượt bàn khó bài" : "Bạn đã hoàn thành bài"} {level.n}
            </div>
            {hard && (
              <div className="anim-bob mx-auto mt-2 w-fit rounded-full bg-emerald-100 px-4 py-1.5 text-[15px] font-extrabold text-emerald-700">
                🌸 Hoa sen sẽ nở trên bàn này!
              </div>
            )}

            <div className="mt-4 flex items-end justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="anim-star"
                  style={{ animationDelay: `${0.15 + i * 0.22}s` }}
                >
                  <StarIcon
                    className={`${i === 1 ? "h-20 w-20" : "h-16 w-16"} ${
                      i < earned ? "text-amber-400" : "text-slate-200"
                    }`}
                    style={{
                      filter:
                        i < earned
                          ? "drop-shadow(0 6px 10px rgba(245,158,11,0.55))"
                          : undefined,
                      transform: i === 1 ? "translateY(-10px)" : undefined,
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-[15px] font-extrabold text-amber-700">
                <StarIcon className="h-4 w-4" /> +{earned * 10}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1.5 text-[15px] font-extrabold text-sky-700">
                💎 +{level.reward}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1.5 text-[15px] font-extrabold text-orange-700">
                🔥 Chuỗi {streak + 1}
              </span>
              {level.type === "chest" && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-[15px] font-extrabold text-emerald-700">
                  <Chest className="h-4 w-4" /> Rương
                </span>
              )}
            </div>

            <button
              onClick={() => onComplete(earned, !!hard)}
              className="mt-5 w-full rounded-2xl bg-[#58cc02] py-3.5 text-[22px] font-extrabold uppercase tracking-wide text-white shadow-[0_5px_0_#46a302] transition-transform active:translate-y-[3px] active:shadow-none"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
