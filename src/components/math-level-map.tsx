"use client";

import { useMemo } from "react";

type MapPoint = { x: number; y: number };

type MathLevelMapProps = {
  onStartQuiz: () => void;
};

const MAP_WIDTH = 430;
const MAP_HEIGHT = 4320;
const LEVEL_GAP = 132;
const COMPLETED_LEVELS = 14;
const AVAILABLE_LEVEL = 15;

const chapters = [
  { title: "Đồng bằng sông nước", range: "Bài 1 - 10", image: "/images/ch1.jpg", color: "#55bc68", top: 0 },
  { title: "Mùa sen hồng", range: "Bài 11 - 20", image: "/images/ch2.jpg", color: "#f2a34e", top: 1395 },
  { title: "Thung lũng đèn trời", range: "Bài 21 - 30", image: "/images/ch3.jpg", color: "#7568d9", top: 2715 },
];

const meander = [0.55, 0.95, 0.8, 0.2, -0.55, -0.95, -0.75, -0.15, 0.5, 0.95, 0.8, 0.2, -0.5, -1, -0.75, 0, 0.6, 1, 0.7, -0.1, -0.8, -1, -0.5, 0.3, 0.9, 1, 0.4, -0.4, -0.9, -0.65, 0.1, 0.7, 0.95, 0.55];

function pointForLevel(level: number): MapPoint {
  const t = (level - 1) / 29;
  const index = Math.min(meander.length - 1, Math.floor(t * (meander.length - 1)));
  const next = Math.min(meander.length - 1, index + 1);
  const fraction = t * (meander.length - 1) - index;
  const wave = meander[index] + (meander[next] - meander[index]) * fraction;
  return { x: 215 + wave * 54 + (level % 5 === 0 ? 18 : level % 2 ? -23 : 24), y: 370 + (level - 1) * LEVEL_GAP };
}

function pathFromPoints(points: MapPoint[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
}

function Pad({ level, locked, completed, current, onClick }: { level: number; locked: boolean; completed: boolean; current: boolean; onClick: () => void }) {
  return (
    <button
      className={`math-map-pad ${completed ? "completed" : ""} ${current ? "current" : ""} ${locked ? "locked" : ""}`}
      onClick={onClick}
      disabled={locked}
      aria-label={`Bài ${level}${locked ? " chưa mở khóa" : ""}`}
    >
      {completed && <span className="math-map-stars">{level % 3 === 0 ? "★ ★ ★" : "★ ★ ☆"}</span>}
      <span className="math-map-pad-number">{locked ? "🔒" : level}</span>
      {current && <span className="math-map-start">BẮT ĐẦU!</span>}
    </button>
  );
}

export default function MathLevelMap({ onStartQuiz }: MathLevelMapProps) {
  const levels = useMemo(() => Array.from({ length: 30 }, (_, index) => ({ level: index + 1, point: pointForLevel(index + 1) })), []);
  const riverPoints = useMemo(() => [
    { x: 215, y: -130 },
    { x: 260, y: 220 },
    ...Array.from({ length: 12 }, (_, index) => ({ x: 215 + meander[index * 2] * 54, y: 650 + index * 330 })),
    { x: 215, y: MAP_HEIGHT + 150 },
  ], []);
  const riverPath = pathFromPoints(riverPoints);

  return (
    <div className="math-map-frame">
      <div className="math-map-hud">
        <div className="math-map-avatar">🌸<strong>15</strong></div>
        <div className="math-map-stat">★ <b>28</b></div>
        <div className="math-map-stat">💎 <b>1.240</b></div>
        <div className="math-map-stat heart">♥ <b>5</b></div>
      </div>
      <div className="math-map-scroll">
        <div className="math-map-world" style={{ height: MAP_HEIGHT }}>
          {chapters.map((chapter, index) => (
            <section className="math-map-chapter" key={chapter.title} style={{ top: chapter.top, height: index === chapters.length - 1 ? MAP_HEIGHT - chapter.top : 1450 }}>
              <img src={chapter.image} alt="" />
              <div className="math-map-chapter-fade" style={{ background: `linear-gradient(to bottom, rgba(8,34,48,.28), ${chapter.color} 92%)` }} />
            </section>
          ))}
          <svg className="math-map-river" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} aria-hidden="true">
            <path d={riverPath} stroke="#eaf9df" strokeWidth="226" fill="none" strokeLinecap="round" />
            <path d={riverPath} stroke="#8ed9ef" strokeWidth="204" fill="none" strokeLinecap="round" />
            <path d={riverPath} stroke="#32aeda" strokeWidth="188" fill="none" strokeLinecap="round" />
            <path d={riverPath} stroke="#8ce4f4" strokeWidth="112" fill="none" strokeLinecap="round" opacity=".3" />
            <path d={riverPath} stroke="#fff" strokeWidth="5" fill="none" strokeDasharray="18 30" opacity=".55" className="math-map-flow" />
          </svg>
          <div className="math-map-title"><strong>ĐƯỜNG SEN</strong><span>TOÁN HỌC</span><small>Nhảy qua các lá sen · 30 bài</small></div>
          <div className="math-map-decor pagoda">🏯</div>
          <div className="math-map-decor buffalo">🐃</div>
          <div className="math-map-decor boat">🛶</div>
          <div className="math-map-decor lantern">🏮</div>
          <div className="math-map-decor butterfly">🦋</div>
          {chapters.slice(1).map((chapter) => (
            <div className="math-map-chapter-banner" key={chapter.title} style={{ top: chapter.top + 180, borderColor: chapter.color }}>
              <span>✦</span><div><strong>{chapter.title}</strong><small>{chapter.range}</small></div><span>✦</span>
            </div>
          ))}
          {levels.map(({ level, point }) => {
            const locked = level > AVAILABLE_LEVEL;
            return (
              <div className="math-map-level" key={level} style={{ left: point.x, top: point.y }}>
                <Pad level={level} locked={locked} completed={level <= COMPLETED_LEVELS} current={level === AVAILABLE_LEVEL} onClick={onStartQuiz} />
                <span className="math-map-level-label">Bài {level}</span>
              </div>
            );
          })}
          <div className="math-map-finish" style={{ top: MAP_HEIGHT - 280 }}><span>🏮</span><strong>Bạn đã đi hết dòng sông!</strong><small>Hoàn thành các bài học để mở chương mới.</small></div>
        </div>
      </div>
      <div className="math-map-legend"><span><i className="done" /> Đã hoàn thành</span><span><i className="current" /> Đang mở</span><span><i className="locked" /> Chưa mở khóa</span></div>
    </div>
  );
}
