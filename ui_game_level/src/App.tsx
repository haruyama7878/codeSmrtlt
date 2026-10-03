import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  MAP_H,
  MAP_W,
  chapters,
  chapterBannerY,
  levels,
  starsFor,
  type Level,
} from "./lib/map";
import MapCanvas from "./components/MapCanvas";
import DecorLayer from "./components/DecorLayer";
import Scenery from "./components/Scenery";
import { ChapterBanner, LevelNode } from "./components/LevelNode";
import { Hud, type TabId } from "./components/Hud";
import { LevelOverlay } from "./components/LevelOverlay";
import { ProfilePanel, QuestPanel, RankPanel } from "./components/Panels";
import { Frog, Lotus } from "./components/art";

export default function App({
  onStartQuiz,
  embedded = false,
  initialCleared = 0,
  lotusPoints = 0,
}: { onStartQuiz?: (lessonNumber: number, mode: "normal" | "retry" | "hard") => void; embedded?: boolean; initialCleared?: number; lotusPoints?: number } = {}) {
  const [cleared, setCleared] = useState(initialCleared);
  const [streak, setStreak] = useState(0);
  const [gems, setGems] = useState(150);
  const [tab, setTab] = useState<TabId>("map");
  const [active, setActive] = useState<Level | null>(null);
  const [hardMode, setHardMode] = useState(false);
  const [modeChoice, setModeChoice] = useState<Level | null>(null);
  const [hardDone, setHardDone] = useState<number[]>([]);
  const [jump, setJump] = useState<{ from: Level; to: Level } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [fit, setFit] = useState({ scale: 1, height: 700 });
  const shellRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | null>(null);

  const current = Math.min(cleared + 1, levels.length);
  const stars = useMemo(() => {
    let s = 0;
    for (let i = 1; i <= cleared; i++) s += starsFor(i);
    return s;
  }, [cleared]);

  /* ---------------- responsive frame scaling ---------------- */
  const [fullBleed, setFullBleed] = useState(true);

  useEffect(() => {
    if (embedded) return;
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setScale(Math.min(w / MAP_W, h / 620, 1.5));
      setFullBleed(w / MAP_W <= h / 620);
    };
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [embedded]);

  /* embedded mode: fit the phone frame inside its own container */
  useEffect(() => {
    if (!embedded) return;
    const shell = shellRef.current;
    if (!shell) return;
    const measure = () => {
      const width = shell.clientWidth;
      const height = shell.clientHeight;
      if (width <= 0 || height <= 0) return;
      setFit({ scale: Math.min(width / MAP_W, 1.5), height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(shell);
    return () => observer.disconnect();
  }, [embedded]);

  const scrollToLevel = useCallback((n: number, smooth = true) => {
    const el = scrollRef.current;
    const lv = levels[n - 1];
    if (!el || !lv) return;
    el.scrollTo({
      top: Math.max(0, lv.pad.y - el.clientHeight * 0.52),
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => scrollToLevel(current, false), 80);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const handleNode = useCallback(
    (lv: Level) => {
      if (lv.n === current) {
        // Lá sen hiện tại: sinh đề AI theo nội dung bài này.
        onStartQuiz?.(lv.n, "normal");
        return;
      }
      if (lv.n <= cleared) {
        // Bài đã xong: chọn làm lại hoặc bàn khó.
        setModeChoice(lv);
      } else {
        showToast(`Hoàn thành bài ${lv.n - 1} để mở khóa 🔒`);
      }
    },
    [cleared, current, onStartQuiz, showToast]
  );

  const completeLevel = useCallback(
    (earned: number, hard: boolean) => {
      const lv = active;
      if (!lv) return;
      if (hard) {
        setGems((g) => g + lv.reward * 2 + earned * 5);
        setHardDone((s) => (s.includes(lv.n) ? s : [...s, lv.n]));
        setActive(null);
        showToast(`🌸 Hoa sen đã nở trên bài ${lv.n}!`);
        return;
      }
      if (lv.n > cleared) {
        setCleared(lv.n);
        const ns = streak + 1;
        setStreak(ns);
        setGems((g) => g + lv.reward + earned * 5 + streak * 2);
        setActive(null);
        const next = lv.n + 1;
        if (next <= levels.length) {
          showToast(`Mở khóa bài ${next}! 🎉`);
          window.setTimeout(() => scrollToLevel(next, true), 260);
          setJump({ from: lv, to: levels[next - 1] });
        } else {
          showToast("Bạn đã chinh phục toàn bộ bản đồ! 🏆");
        }
        if (ns % 5 === 0) {
          window.setTimeout(() => showToast(`Chuỗi ${ns} bàn liên tiếp! 🔥`), 900);
        }
      } else {
        // replay of an older level
        setGems((g) => g + lv.reward + earned * 5);
        setActive(null);
        showToast(`Làm lại bài ${lv.n} thành công! 🎉`);
      }
    },
    [active, cleared, streak, scrollToLevel, showToast]
  );

  /* safety net: clear a stuck hop */
  useEffect(() => {
    if (!jump) return;
    const t = window.setTimeout(() => setJump(null), 3200);
    return () => window.clearTimeout(t);
  }, [jump]);

  const nodeState = (n: number): "done" | "current" | "locked" =>
    n <= cleared ? "done" : n === current ? "current" : "locked";

  /* chương đã hoàn thành khi bài cuối cùng của chương đã vượt qua */
  const chapterDone = (chapterId: number) => {
    const chapterLevels = levels.filter((lv) => lv.chapter === chapterId - 1);
    if (!chapterLevels.length) return false;
    return chapterLevels[chapterLevels.length - 1].n <= cleared;
  };

  return (
    <div
      ref={shellRef}
      className={
        embedded
          ? "relative mx-auto w-full max-w-[600px] overflow-hidden rounded-[26px] border-4 border-white/10 bg-[#08161f] shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
          : "fixed inset-0 flex items-start justify-center overflow-hidden bg-[#08161f]"
      }
      style={embedded ? { height: "max(430px, calc(100vh - 184px))" } : undefined}
    >
      {/* ambient backdrop behind the phone frame */}
      {!embedded && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 40% at 50% 0%, rgba(56,189,248,0.25), transparent 70%), radial-gradient(50% 40% at 20% 100%, rgba(16,185,129,0.22), transparent 70%), radial-gradient(50% 40% at 85% 60%, rgba(168,85,247,0.18), transparent 70%)",
          }}
        />
      )}

      <div
        className={
          embedded
            ? "relative mx-auto overflow-hidden"
            : `relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.65)] ${
                fullBleed ? "" : "rounded-[30px] ring-1 ring-white/10"
              }`
        }
        style={
          embedded
            ? {
                width: MAP_W,
                height: fit.height / fit.scale,
                transform: `scale(${fit.scale})`,
                transformOrigin: "top center",
              }
            : {
                width: MAP_W,
                height: `calc(100dvh / ${scale})`,
                transform: `scale(${scale})`,
                transformOrigin: "top center",
              }
        }
      >
        {/* ---------------- scrollable world map ---------------- */}
        <div
          ref={scrollRef}
          className="no-scrollbar relative h-full w-full overflow-y-auto overscroll-contain bg-[#8fd44f]"
        >
          <div className="relative" style={{ height: MAP_H }}>
            {/* per-chapter base color (seamless under vista images) */}
            {chapters.map((c) => (
              <div
                key={`bg${c.id}`}
                className="absolute inset-x-0"
                style={{ top: c.top, height: c.height, background: c.ground }}
              />
            ))}

            {/* procedural scenery (base layer, also a fallback) */}
            {chapters.map((c) => (
              <div
                key={`s${c.id}`}
                className="absolute inset-x-0 z-0"
                style={{ top: c.top, height: c.height }}
              >
                <Scenery chapter={c} />
              </div>
            ))}

            {/* painted vista at the head of every chapter */}
            {chapters.map((c, i) => (
              <div
                key={c.id}
                className="absolute inset-x-0 z-[1]"
                style={{
                  top: c.top,
                  height: c.img ? 740 : 0,
                  backgroundImage: c.img ? `url(${c.img})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-32"
                  style={{ background: "linear-gradient(to bottom, rgba(12,48,18,0.45), rgba(12,48,18,0))" }}
                />
                {i > 0 && (
                  <div
                    className="absolute inset-x-0 top-0 h-44"
                    style={{
                      background: `linear-gradient(to bottom, ${chapters[i - 1].ground}, ${chapters[i - 1].ground}00)`,
                    }}
                  />
                )}
                <div
                  className="absolute inset-x-0 bottom-0 h-56"
                  style={{ background: `linear-gradient(to bottom, ${c.ground}00, ${c.ground})` }}
                />
              </div>
            ))}

            <MapCanvas />
            <DecorLayer />

            {/* title card in the sky */}
            <div
              className="pointer-events-none absolute z-40 w-full text-center"
              style={{ top: 124 }}
            >
              <div className="anim-float inline-block">
                <h1 className="stroke-brown text-[40px] font-extrabold leading-none text-white drop-shadow-xl">
                  SEN SÔNG
                </h1>
                <h2 className="stroke-brown -mt-1 text-[34px] font-extrabold leading-none text-amber-300">
                  THẦN BÍ
                </h2>
                <p className="stroke-dark mt-2 flex items-center justify-center gap-1.5 text-[15px] font-bold text-white/90">
                  <Lotus className="h-[22px] w-[22px] drop-shadow" />
                  Nhảy qua các lá sen · 100 bài học
                  <Lotus className="h-[22px] w-[22px] -scale-x-100 drop-shadow" />
                </p>
              </div>
            </div>

            {/* chapter banners */}
            {chapterBannerY.map(
              (y, i) =>
                y > 0 && (
                  <ChapterBanner
                    key={i}
                    y={y}
                    title={chapters[i].title}
                    range={chapters[i].range}
                    topic={chapters[i].topic}
                    accent={chapters[i].accent}
                    done={chapterDone(chapters[i].id)}
                  />
                )
            )}

            {/* level nodes */}
            {levels.map((lv) => (
              <LevelNode
                key={lv.n}
                level={lv}
                state={nodeState(lv.n)}
                stars={starsFor(lv.n)}
                opened={false}
                heroHidden={jump?.to.n === lv.n}
                hardDone={hardDone.includes(lv.n)}
                onClick={() => handleNode(lv)}
              />
            ))}

            {/* frog hopping to the next pad after a win */}
            {jump && <FrogJump from={jump.from} to={jump.to} onDone={() => setJump(null)} />}

            {/* footer */}
            <div
              className="absolute z-40 w-full px-8"
              style={{ top: levels[levels.length - 1].pad.y + 300 }}
            >
              <div className="rounded-3xl border-[4px] border-white/60 bg-white/85 p-5 text-center shadow-2xl">
                <div className="text-4xl">🏮</div>
                <div className="mt-1 text-[20px] font-extrabold text-emerald-800">
                  Bạn đã đi hết dòng sông!
                </div>
                <p className="mt-1 text-[14px] font-bold text-emerald-700/70">
                  Chương mới đang được vẽ thêm… quay lại sau nhé 🌱
                </p>
                <button
                  onClick={() => scrollToLevel(1, true)}
                  className="mt-3 rounded-xl bg-emerald-500 px-5 py-2 text-[15px] font-extrabold uppercase text-white shadow-[0_4px_0_#047857] active:translate-y-[2px]"
                >
                  Về đầu bản đồ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- fixed ui ---------------- */}
        <Hud level={current} stars={stars} lotusPoints={lotusPoints} streak={streak} />

        {/* scroll-to-me button */}
        <div className="absolute bottom-24 right-3 z-50 flex flex-col items-center gap-1">
          <button
            onClick={() => scrollToLevel(current, true)}
            className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-white bg-emerald-500 shadow-lg active:scale-90"
            aria-label="Về bài hiện tại"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 drop-shadow" aria-hidden="true">
              <path
                d="M12 1.5 C7.3 1.5 3.5 5.3 3.5 9.9 C3.5 14.9 12 22.5 12 22.5 C12 22.5 20.5 14.9 20.5 9.9 C20.5 5.3 16.7 1.5 12 1.5 Z"
                fill="#ffffff"
                stroke="#0f766e"
                strokeWidth="1.6"
              />
              <circle cx="12" cy="9.8" r="3.1" fill="#f97316" stroke="#c2410c" strokeWidth="1" />
            </svg>
          </button>
          <span className="rounded-full bg-[#0d3a16]/90 px-2 py-0.5 text-[10px] font-extrabold text-white shadow">
            Vị trí hiện tại
          </span>
        </div>

        {toast && (
          <div className="anim-pop pointer-events-none absolute bottom-[92px] left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#0d3a16]/90 px-5 py-2.5 text-[15px] font-extrabold text-white shadow-xl backdrop-blur">
            {toast}
          </div>
        )}

        {/* ---------------- overlays ---------------- */}
        {active && (
          <LevelOverlay
            level={active}
            streak={streak}
            hard={hardMode}
            onComplete={completeLevel}
            onClose={() => setActive(null)}
          />
        )}

        {/* replay / hard-mode choice for completed levels */}
        {modeChoice && (
          <div className="absolute inset-0 z-[85] flex items-center justify-center px-5">
            <div
              className="anim-fade absolute inset-0 bg-[#0b2e12]/70 backdrop-blur-sm"
              onClick={() => setModeChoice(null)}
            />
            <div className="anim-pop relative w-full max-w-[330px] rounded-[30px] border-[5px] border-white/70 bg-gradient-to-b from-emerald-50 to-white px-5 pb-5 pt-6 text-center shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
              <div className="text-[13px] font-extrabold uppercase tracking-wide text-emerald-600">
                {hardDone.includes(modeChoice.n) ? "🌸 Bàn này đã nở hoa sen" : "Đã hoàn thành"}
              </div>
              <div className="mt-1 text-[36px] font-extrabold leading-none text-emerald-800">
                Bài {modeChoice.n}
              </div>
              <button
                onClick={() => {
                  const target = modeChoice;
                  setModeChoice(null);
                  if (target) onStartQuiz?.(target.n, "retry");
                }}
                className="mt-4 w-full rounded-2xl bg-[#58cc02] py-3.5 text-[20px] font-extrabold uppercase tracking-wide text-white shadow-[0_5px_0_#46a302] transition-transform active:translate-y-[3px] active:shadow-none"
              >
                Làm lại
              </button>
              <button
                onClick={() => {
                  const target = modeChoice;
                  setModeChoice(null);
                  if (target) onStartQuiz?.(target.n, "hard");
                }}
                className="mt-2.5 w-full rounded-2xl bg-gradient-to-b from-orange-400 to-rose-500 py-3.5 text-[20px] font-extrabold uppercase tracking-wide text-white shadow-[0_5px_0_#be123c] transition-transform active:translate-y-[3px] active:shadow-none"
              >
                🔥 Làm bàn khó
              </button>
              <button
                onClick={() => setModeChoice(null)}
                className="mt-2.5 w-full rounded-2xl border-2 border-slate-200 py-2.5 text-[15px] font-extrabold uppercase tracking-wide text-slate-400 transition-transform active:translate-y-[2px]"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {tab === "rank" && (
          <RankPanel stars={stars} cleared={cleared} onClose={() => setTab("map")} />
        )}
        {tab === "quest" && (
          <QuestPanel cleared={cleared} stars={stars} onClose={() => setTab("map")} />
        )}
        {tab === "me" && (
          <ProfilePanel
            cleared={cleared}
            stars={stars}
            gems={gems}
            streak={streak}
            onClose={() => setTab("map")}
            onReset={() => {
              setCleared(0);
              setStreak(0);
              setGems(150);
              setTab("map");
              showToast("Bắt đầu lại từ bài 1 🌱");
              window.setTimeout(() => scrollToLevel(1, true), 200);
            }}
          />
        )}
      </div>
    </div>
  );
}

/* --------------------- frog hop to the next pad --------------------- */

function FrogJump({
  from,
  to,
  onDone,
}: {
  from: Level;
  to: Level;
  onDone: () => void;
}) {
  const [landed, setLanded] = useState(false);
  const dx = to.pad.x - from.pad.x;
  const dy = to.pad.y - from.pad.y;
  const dist = Math.hypot(dx, dy);
  const hop = Math.max(90, Math.min(170, dist * 0.55));
  const dur = Math.min(1.25, Math.max(0.85, dist / 240));

  useEffect(() => {
    if (!landed) return;
    const t = window.setTimeout(onDone, 850);
    return () => window.clearTimeout(t);
  }, [landed, onDone]);

  return (
    <div
      className="pointer-events-none absolute z-[41]"
      style={{ left: from.pad.x, top: from.pad.y, transform: "translate(-50%, -50%)" }}
    >
      {!landed && (
        <div
          className="anim-frog-hop"
          style={
            {
              "--dx": `${dx}px`,
              "--dy": `${dy}px`,
              "--hop": `${hop}px`,
              "--hopdur": `${dur}s`,
            } as CSSProperties
          }
          onAnimationEnd={() => setLanded(true)}
        >
          <Frog className="h-[74px] w-[74px] drop-shadow-xl" />
        </div>
      )}

      {landed && (
        <div className="absolute" style={{ left: dx, top: dy }}>
          <span
            className="anim-splash absolute rounded-full border-4 border-white/80"
            style={{ width: 98, height: 98, left: -49, top: -49 }}
          />
          <span
            className="anim-splash absolute rounded-full border-4 border-amber-300"
            style={{ width: 98, height: 98, left: -49, top: -49, animationDelay: "0.18s" }}
          />
        </div>
      )}
    </div>
  );
}
