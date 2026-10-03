import type { ReactNode } from "react";
import { StarIcon } from "./art";

export function Sheet({
  title,
  emoji,
  onClose,
  children,
}: {
  title: string;
  emoji: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-[70] flex items-end">
      <div className="anim-fade absolute inset-0 bg-[#081f0d]/65 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="anim-pop relative max-h-[76%] w-full overflow-y-auto rounded-t-[30px] border-t-4 border-white/25 bg-[#113c1a] px-4 pb-8 pt-4 shadow-[0_-14px_40px_rgba(0,0,0,0.5)]"
        style={{ fontFamily: "inherit" }}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/25" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[22px] font-extrabold text-white">
            <span className="text-2xl">{emoji}</span> {title}
          </h2>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white active:scale-90"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const cardCls =
  "flex items-center gap-3 rounded-2xl border-2 border-white/10 bg-white/[0.06] p-3";

export function RankPanel({
  stars,
  cleared,
  onClose,
}: {
  stars: number;
  cleared: number;
  onClose: () => void;
}) {
  const board = [
    { n: "Mai Anh", e: "🦊", s: 268 },
    { n: "Quốc Bảo", e: "🐼", s: 241 },
    { n: "Thu Hà", e: "🐰", s: 212 },
    { n: "Bạn", e: "🐸", s: stars, me: true },
    { n: "Minh Đức", e: "🐯", s: Math.max(60, stars - 24) },
    { n: "Lan Chi", e: "🐧", s: Math.max(40, stars - 61) },
    { n: "Hoàng Nam", e: "🐨", s: Math.max(20, stars - 90) },
  ].sort((a, b) => b.s - a.s);

  return (
    <Sheet title="Bảng xếp hạng" emoji="🏆" onClose={onClose}>
      <div className="space-y-2">
        {board.map((p, i) => (
          <div
            key={p.n}
            className={`flex items-center gap-3 rounded-2xl p-3 ${
              p.me
                ? "border-2 border-emerald-400/70 bg-emerald-400/15"
                : "border-2 border-white/10 bg-white/[0.05]"
            }`}
          >
            <span className="w-7 text-center text-[18px] font-extrabold text-white/70">
              {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
            </span>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xl">
              {p.e}
            </span>
            <span className="flex-1 text-[17px] font-extrabold text-white">{p.n}</span>
            <span className="flex items-center gap-1 text-[16px] font-extrabold text-amber-300">
              <StarIcon className="h-4 w-4" /> {p.s}
            </span>
          </div>
        ))}
      </div>
      <p className="pt-3 text-center text-[13px] font-bold text-white/40">
        Bạn đã phá đảo {cleared} bài · Danh hiệu: {cleared >= 70 ? "Trùm Sông Nước" : cleared >= 35 ? "Kỵ Sĩ Sen Hồng" : "Tân Binh Đồng Bằng"}
      </p>
    </Sheet>
  );
}

export function QuestPanel({
  cleared,
  stars,
  onClose,
}: {
  cleared: number;
  stars: number;
  onClose: () => void;
}) {
  const quests = [
    { i: "🗺️", t: "Hoàn thành 5 bài", c: 5, p: cleared, r: "💎 50" },
    { i: "⭐", t: "Thu thập 30 sao", c: 30, p: stars, r: "💎 80" },
    { i: "👑", t: "Hạ 1 bài trùm", c: 1, p: [17, 34, 51, 68, 84, 100].filter((n) => n <= cleared).length, r: "🎁" },
    { i: "🔥", t: "Chuỗi 3 ngày liên tiếp", c: 3, p: Math.min(3, cleared), r: "❤️ 1" },
  ];
  return (
    <Sheet title="Nhiệm vụ ngày" emoji="📜" onClose={onClose}>
      <div className="space-y-3">
        {quests.map((q) => {
          const pct = Math.min(100, (q.p / q.c) * 100);
          const done = q.p >= q.c;
          return (
            <div key={q.t} className={cardCls}>
              <span className="text-3xl">{q.i}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[16px] font-extrabold text-white">{q.t}</span>
                  <span className="text-[13px] font-extrabold text-amber-300">{q.r}</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/40">
                  <div
                    className={`h-full rounded-full ${done ? "bg-amber-400" : "bg-emerald-400"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1 text-right text-[12px] font-bold text-white/45">
                  {Math.min(q.p, q.c)}/{q.c}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}

export function ProfilePanel({
  cleared,
  stars,
  gems,
  streak,
  onReset,
  onClose,
}: {
  cleared: number;
  stars: number;
  gems: number;
  streak: number;
  onReset: () => void;
  onClose: () => void;
}) {
  const stat = (label: string, value: string, icon: string) => (
    <div className="rounded-2xl border-2 border-white/10 bg-white/[0.06] p-4 text-center">
      <div className="text-2xl">{icon}</div>
      <div className="mt-1 text-[24px] font-extrabold text-white">{value}</div>
      <div className="text-[12px] font-bold uppercase text-white/45">{label}</div>
    </div>
  );
  return (
    <Sheet title="Hồ sơ" emoji="🐸" onClose={onClose}>
      <div className="mb-4 flex items-center gap-4 rounded-3xl border-2 border-white/10 bg-white/[0.06] p-4">
        <div className="grid h-16 w-16 place-items-center rounded-full border-[3px] border-emerald-400 bg-gradient-to-b from-emerald-300 to-emerald-600 text-3xl">
          🐸
        </div>
        <div>
          <div className="text-[20px] font-extrabold text-white">Ếch Con Phiêu Lưu</div>
          <div className="text-[13px] font-bold text-emerald-300">
            {cleared >= 25 ? "Trùm Sông Nước" : cleared >= 10 ? "Kỵ Sĩ Sen Hồng" : "Tân Binh Đồng Bằng"}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
            {stat("Bài đã qua", `${cleared}/100`, "🚩")}
        {stat("Tổng sao", `${stars}`, "⭐")}
        {stat("Kim cương", `${gems}`, "💎")}
        {stat("Chuỗi thắng", `${streak}`, "🔥")}
      </div>
      <button
        onClick={onReset}
        className="mt-4 w-full rounded-2xl border-2 border-rose-400/50 py-3 text-[16px] font-extrabold uppercase text-rose-300 active:translate-y-[2px]"
      >
        Làm lại từ đầu
      </button>
    </Sheet>
  );
}
