import {
  catmullRom,
  cumulativeLengths,
  offsetPoint,
  pointAt,
  toPath,
  type Pt,
  type Sample,
} from "./curve";

export const MAP_W = 430;
export const LEVEL_GAP = 184;
export const START_LEN = 600;
export const MAP_H = 20000;

export type LevelType = "normal" | "boss" | "chest";

export type Level = {
  n: number;
  localN: number;
  chapter: number; // 0..5
  type: LevelType;
  goal: string;
  goalIcon: string;
  moves: number;
  reward: number;
  pad: Pt;
  angle: number;
};

export type Chapter = {
  id: number;
  title: string;
  range: string;
  img: string;
  accent: string;
  ground: string;
  topic: string;
  top: number;
  height: number;
};

/* ------------------------------------------------------------------ */
/*  River center line                                                  */
/* ------------------------------------------------------------------ */

const MEANDER = [
  0.55, 0.95, 0.8, 0.2, -0.55, -0.95, -0.75, -0.15, 0.5, 0.95, 0.8, 0.2, -0.5,
  -1.0, -0.75, 0.0, 0.6, 1.0, 0.7, -0.1, -0.8, -1.0, -0.5, 0.3, 0.9, 1.0, 0.4,
  -0.4, -0.9, -0.65, 0.1, 0.7, 0.95, 0.55, -0.2, -0.8,
];

const AMP = 54;

const ctrl: Pt[] = Array.from({ length: 110 }, (_, i) => ({
  x: 215 + MEANDER[i % MEANDER.length] * AMP,
  y: -180 + i * 200,
}));

export const centerline: Pt[] = catmullRom(ctrl, 20);
export const centerPath = toPath(centerline);
export const centerCum = cumulativeLengths(centerline);
export const totalLength = centerCum[centerCum.length - 1];

function sampleAtLen(len: number): Sample {
  return pointAt(centerline, centerCum, len);
}

/** A wavy "current" / foam line inside the river, offset from the centre. */
export function flowPath(side: number, amount: number, fromLen = 0, toLen = totalLength): string {
  const pts: Pt[] = [];
  for (let d = fromLen; d <= toLen; d += 26) {
    pts.push(offsetPoint(sampleAtLen(d), side, amount));
  }
  return toPath(pts);
}

/** X coordinate of the river bank at a given Y (side: -1 left, +1 right). */
export function bankX(y: number, side: number, dist: number): number {
  let best = centerline[0];
  for (const p of centerline) {
    if (Math.abs(p.y - y) < Math.abs(best.y - y)) best = p;
  }
  return best.x + side * dist;
}

/* ------------------------------------------------------------------ */
/*  Levels                                                             */
/* ------------------------------------------------------------------ */

const OFFSETS = [52, -52, 48, -48, 0];

/* ------------------------------------------------------------------ */
/*  Lộ trình 6 chương theo chương trình Toán lớp 1 – 100 bài            */
/* ------------------------------------------------------------------ */

const ROADMAP = [
  {
    title: "Làm quen với Toán học",
    topic: "So sánh và làm quen với số",
    img: "/images/chap1.jpg",
    accent: "#4fbf6a",
    ground: "#7ed14f",
    size: 17,
  },
  {
    title: "Các số từ 0 đến 10",
    topic: "Đọc, viết, đếm và so sánh số ≤ 10",
    img: "/images/chap2.jpg",
    accent: "#e38b3f",
    ground: "#8fbe59",
    size: 17,
  },
  {
    title: "Cộng và trừ trong phạm vi 10",
    topic: "Thực hiện cộng, trừ ≤ 10",
    img: "/images/chap3.jpg",
    accent: "#4e9fcb",
    ground: "#67b06a",
    size: 17,
  },
  {
    title: "Các số đến 100",
    topic: "Hiểu cấu tạo và thứ tự số ≤ 100",
    img: "/images/chap4.png",
    accent: "#d56b3d",
    ground: "#29a480",
    size: 17,
  },
  {
    title: "Cộng và trừ trong phạm vi 100",
    topic: "Tính toán và vận dụng",
    img: "/images/chap5.png",
    accent: "#a96cb3",
    ground: "#59812d",
    size: 16,
  },
  {
    title: "Toán học trong cuộc sống",
    topic: "Vận dụng vào tình huống thực tế",
    img: "/images/chap6.png",
    accent: "#bd6538",
    ground: "#2c8fb3",
    size: 16,
  },
];

const CHAPTER_GOALS = [
  { goal: "Thu thập đóa sen", icon: "🪷" },
  { goal: "Thu thập đom đóm", icon: "✨" },
  { goal: "Thả đèn trời", icon: "🏮" },
  { goal: "Thu thập viên ngọc", icon: "🧮" },
  { goal: "Thả diều ước mơ", icon: "📏" },
  { goal: "Thắp đèn ông sao", icon: "⏰" },
];

export const LEVEL_COUNT = 100;

let runningCount = 0;
const chapterStartIndex = ROADMAP.map((chapter) => {
  const start = runningCount;
  runningCount += chapter.size;
  return start;
});

function chapterIndexFor(n: number) {
  for (let c = ROADMAP.length - 1; c >= 0; c -= 1) {
    if (n - 1 >= chapterStartIndex[c]) return c;
  }
  return 0;
}

function levelArc(n: number) {
  return START_LEN + (n - 1) * LEVEL_GAP;
}

export const levels: Level[] = Array.from({ length: LEVEL_COUNT }, (_, i) => {
  const n = i + 1;
  const chapter = chapterIndexFor(n);
  const chapterMeta = ROADMAP[chapter];
  const localN = n - chapterStartIndex[chapter];
  const type: LevelType =
    localN === chapterMeta.size ? "boss" : localN % 4 === 0 ? "chest" : "normal";
  const s = sampleAtLen(levelArc(n));
  const off = OFFSETS[i % 5];
  const pad = offsetPoint(s, off >= 0 ? 1 : -1, Math.abs(off));
  const g = CHAPTER_GOALS[chapter];
  return {
    n,
    localN,
    chapter,
    type,
    goal: g.goal,
    goalIcon: g.icon,
    moves: 20 + ((n * 7) % 15),
    reward: type === "boss" ? 60 : 12,
    pad,
    angle: s.angle,
  };
});

/** Stable pseudo-random star rating per level. */
export function starsFor(n: number) {
  if (n === 1) return 3;
  const h = Math.abs(Math.sin(n * 12.9898) * 43758.5453) % 1;
  return h < 0.22 ? 1 : h < 0.62 ? 2 : 3;
}

/* ------------------------------------------------------------------ */
/*  Candy-crush style ribbon through the pads                          */
/* ------------------------------------------------------------------ */

export const reachedPads = (cleared: number): Pt[] => {
  const done = levels.filter((l) => l.n <= cleared).map((l) => l.pad);
  const next = levels.find((l) => l.n === cleared + 1);
  return next ? [...done, next.pad] : done;
};

export const trailPathAll = toPath(catmullRom(levels.map((l) => l.pad), 16));

/* ------------------------------------------------------------------ */
/*  Chapters                                                           */
/* ------------------------------------------------------------------ */

export const CHAPTER_META = ROADMAP.map((chapter, index) => ({
  id: index + 1,
  title: chapter.title,
  range: `Bài ${chapterStartIndex[index] + 1} – ${chapterStartIndex[index] + chapter.size}`,
  img: chapter.img,
  accent: chapter.accent,
  ground: chapter.ground,
  topic: chapter.topic,
}));

const bandTops = CHAPTER_META.map((_, c) => (c === 0 ? 0 : levels[chapterStartIndex[c]].pad.y - 470));

export const chapters: Chapter[] = CHAPTER_META.map((m, c) => ({
  ...m,
  top: bandTops[c],
  height: (c < CHAPTER_META.length - 1 ? bandTops[c + 1] : MAP_H) - bandTops[c],
}));

export const chapterBannerY = CHAPTER_META.map((_, c) =>
  c === 0 ? -1 : levels[chapterStartIndex[c]].pad.y - 520
);

export type SceneDetail = {
  e: string;
  x: number;
  y: number;
  s: number;
  d: number;
};

const CHAPTER_DETAILS = [
  ["🌾", "🛶", "🐃", "🌴", "🪷"],
  ["⛰️", "🌾", "🛖", "🌲", "🧺"],
  ["⛰️", "🚤", "🐚", "🌊", "🛶"],
  ["🏮", "🛶", "🌺", "🌴", "🎐"],
  ["🪷", "🏯", "🎐", "🌿", "🛶"],
  ["☕", "🌲", "🪘", "⛰️", "🌾"],
] as const;

export const sceneDetails: SceneDetail[] = chapters.flatMap((chapter, chapterIndex) =>
  CHAPTER_DETAILS[chapterIndex].map((e, i) => {
    const y = chapter.top + 230 + i * 300;
    const side = i % 2 === 0 ? -1 : 1;
    return {
      e,
      x: bankX(y, side, 126 + (i % 2) * 12),
      y,
      s: 0.9 + (i % 3) * 0.12,
      d: chapterIndex * 0.3 + i * 0.45,
    };
  })
);

/* ------------------------------------------------------------------ */
/*  Decor – automatically glued to the correct river bank              */
/* ------------------------------------------------------------------ */

export type DecorKind =
  | "buffalo"
  | "boat"
  | "pagoda"
  | "tree"
  | "lotus"
  | "reed"
  | "rock"
  | "lantern"
  | "lilyclump"
  | "bridge"
  | "redbridge"
  | "duck"
  | "carp"
  | "crab";

type DecorSeed = {
  kind: DecorKind;
  y: number;
  side: 1 | -1;
  gap: number; // distance from the river centre to the item centre
  s: number;
  flip?: boolean;
};

const SEEDS: DecorSeed[] = [
  { kind: "pagoda", y: 130, side: 1, gap: 130, s: 1 },
  { kind: "tree", y: 260, side: -1, gap: 118, s: 1 },
  { kind: "duck", y: 340, side: -1, gap: 46, s: 1 },
  { kind: "boat", y: 430, side: 1, gap: 74, s: 1 },
  { kind: "buffalo", y: 660, side: 1, gap: 108, s: 1, flip: true },
  { kind: "lotus", y: 560, side: -1, gap: 86, s: 1 },
  { kind: "rock", y: 760, side: -1, gap: 92, s: 1 },
  { kind: "carp", y: 880, side: 1, gap: 30, s: 1 },
  { kind: "tree", y: 960, side: 1, gap: 112, s: 0.9 },
  { kind: "reed", y: 1180, side: 1, gap: 94, s: 1 },
  { kind: "lilyclump", y: 1400, side: -1, gap: 60, s: 1 },
  { kind: "duck", y: 1080, side: 1, gap: 44, s: 1, flip: true },
  { kind: "crab", y: 1310, side: -1, gap: 90, s: 1 },
  { kind: "duck", y: 1720, side: 1, gap: 44, s: 0.95 },

  { kind: "boat", y: 1860, side: -1, gap: 70, s: 0.95, flip: true },
  { kind: "lotus", y: 2040, side: 1, gap: 88, s: 1 },
  { kind: "tree", y: 2320, side: -1, gap: 112, s: 1 },
  { kind: "carp", y: 2440, side: -1, gap: 28, s: 1, flip: true },
  { kind: "buffalo", y: 2680, side: 1, gap: 108, s: 1 },
  { kind: "crab", y: 2960, side: 1, gap: 94, s: 0.9 },
  { kind: "rock", y: 2550, side: 1, gap: 92, s: 1 },
  { kind: "lantern", y: 2820, side: 1, gap: 96, s: 1 },
  { kind: "lotus", y: 3100, side: -1, gap: 90, s: 1.1 },
  { kind: "duck", y: 3260, side: 1, gap: 48, s: 0.95, flip: true },

  { kind: "tree", y: 3480, side: 1, gap: 106, s: 0.85 },
  { kind: "boat", y: 3880, side: 1, gap: 72, s: 1 },
  { kind: "crab", y: 4040, side: -1, gap: 92, s: 1 },
  { kind: "reed", y: 4240, side: -1, gap: 96, s: 1 },
  { kind: "duck", y: 4360, side: 1, gap: 46, s: 1 },
  { kind: "lantern", y: 4560, side: -1, gap: 98, s: 1 },
  { kind: "carp", y: 4760, side: -1, gap: 26, s: 1, flip: true },
  { kind: "pagoda", y: 4920, side: -1, gap: 112, s: 0.8 },
  { kind: "lotus", y: 5220, side: 1, gap: 90, s: 1 },
  { kind: "carp", y: 5400, side: -1, gap: 28, s: 1, flip: true },
  { kind: "tree", y: 5600, side: 1, gap: 112, s: 1 },

  /* Phố Cổ Hội An – đèn lồng, Chùa Cầu */
  { kind: "bridge", y: 5520, side: 1, gap: -14, s: 1 },
  { kind: "lantern", y: 6240, side: 1, gap: 100, s: 1 },
  { kind: "boat", y: 6560, side: -1, gap: 70, s: 0.95, flip: true },
  { kind: "lantern", y: 6920, side: -1, gap: 98, s: 1 },
  { kind: "lotus", y: 7120, side: 1, gap: 88, s: 1 },
  { kind: "duck", y: 7340, side: -1, gap: 44, s: 0.95, flip: true },
  { kind: "carp", y: 6480, side: -1, gap: 28, s: 1 },
  { kind: "crab", y: 7040, side: 1, gap: 92, s: 1 },

  /* Cố Đô Huế */
  { kind: "pagoda", y: 7720, side: -1, gap: 112, s: 1 },
  { kind: "lotus", y: 8060, side: 1, gap: 88, s: 1 },
  { kind: "lantern", y: 8400, side: 1, gap: 98, s: 1 },
  { kind: "tree", y: 8760, side: -1, gap: 112, s: 0.9 },
  { kind: "carp", y: 8340, side: -1, gap: 26, s: 1, flip: true },
  { kind: "crab", y: 8840, side: 1, gap: 94, s: 0.95 },
  { kind: "duck", y: 9120, side: 1, gap: 46, s: 1 },

  /* Cao Nguyên Tây Nguyên */
  { kind: "tree", y: 9500, side: 1, gap: 110, s: 1 },
  { kind: "buffalo", y: 9900, side: -1, gap: 108, s: 1, flip: true },
  { kind: "rock", y: 10320, side: 1, gap: 92, s: 1 },
  { kind: "tree", y: 10700, side: -1, gap: 112, s: 0.9 },
  { kind: "crab", y: 10140, side: 1, gap: 94, s: 1 },
  { kind: "duck", y: 9660, side: -1, gap: 44, s: 1, flip: true },
  { kind: "carp", y: 10520, side: 1, gap: 28, s: 1 },

  /* Đảo Ngọc Phú Quốc */
  { kind: "boat", y: 11300, side: 1, gap: 72, s: 1 },
  { kind: "lilyclump", y: 11720, side: -1, gap: 58, s: 1 },
  { kind: "tree", y: 12140, side: -1, gap: 110, s: 1 },
  { kind: "carp", y: 11560, side: -1, gap: 26, s: 1 },
  { kind: "rock", y: 12560, side: 1, gap: 92, s: 1 },
  { kind: "duck", y: 11960, side: 1, gap: 46, s: 1 },
  { kind: "crab", y: 12340, side: -1, gap: 90, s: 1 },

  /* Non Nước Ninh Bình */
  { kind: "boat", y: 13280, side: -1, gap: 70, s: 0.95, flip: true },
  { kind: "lotus", y: 13660, side: 1, gap: 88, s: 1 },
  { kind: "reed", y: 14100, side: -1, gap: 96, s: 1 },
  { kind: "rock", y: 14500, side: 1, gap: 92, s: 1 },
  { kind: "duck", y: 13820, side: 1, gap: 46, s: 1 },
  { kind: "carp", y: 13420, side: 1, gap: 28, s: 1, flip: true },
  { kind: "crab", y: 14300, side: -1, gap: 92, s: 1 },

  /* Sương Mù Sa Pa */
  { kind: "tree", y: 15080, side: 1, gap: 110, s: 1 },
  { kind: "reed", y: 15540, side: -1, gap: 96, s: 1 },
  { kind: "rock", y: 15960, side: 1, gap: 92, s: 1 },
  { kind: "tree", y: 16340, side: -1, gap: 112, s: 0.9 },
  { kind: "duck", y: 15320, side: -1, gap: 44, s: 1, flip: true },
  { kind: "crab", y: 16140, side: 1, gap: 94, s: 1 },
  { kind: "carp", y: 16700, side: 1, gap: 26, s: 1 },

  /* Hà Nội Ngàn Năm */
  { kind: "pagoda", y: 17000, side: -1, gap: 112, s: 0.9 },
  { kind: "redbridge", y: 17480, side: 1, gap: -14, s: 1 },
  { kind: "lantern", y: 17940, side: 1, gap: 98, s: 1 },
  { kind: "lotus", y: 18380, side: -1, gap: 88, s: 1 },
  { kind: "carp", y: 17660, side: -1, gap: 30, s: 1, flip: true },
  { kind: "tree", y: 18900, side: 1, gap: 110, s: 1 },
  { kind: "buffalo", y: 17160, side: -1, gap: 108, s: 1, flip: true },
  { kind: "duck", y: 18140, side: -1, gap: 46, s: 1 },
  { kind: "crab", y: 18640, side: 1, gap: 92, s: 1 },
];

export type Decor = {
  kind: DecorKind;
  x: number;
  y: number;
  s: number;
  flip?: boolean;
};
function clearOfPads(y: number): number {
  const MIN_DIST = 150;
  // nearest pad above and below
  let lo = -Infinity;
  let hi = Infinity;
  for (const l of levels) {
    if (l.pad.y <= y) lo = Math.max(lo, l.pad.y);
    else hi = Math.min(hi, l.pad.y);
  }
  let out = y;
  if (out - lo < MIN_DIST) out = lo + MIN_DIST;
  if (hi - out < MIN_DIST) out = hi - MIN_DIST;
  // if the gap between pads is too tight, snap to its middle
  if (out < lo + MIN_DIST || out > hi - MIN_DIST) {
    out = (lo + hi) / 2;
  }
  return out;
}

export const decor: Decor[] = SEEDS.map((s) => {
  const y = clearOfPads(s.y);
  // animals stay on the side OPPOSITE the nearest pad so they never hide under a node
  let side: 1 | -1 = s.side;
  const isAnimal = s.gap <= 50 || s.kind === "buffalo" || s.kind === "crab";
  if (isAnimal) {
    let nearest: Level | null = null;
    for (const l of levels) {
      if (!nearest || Math.abs(l.pad.y - y) < Math.abs(nearest.pad.y - y)) nearest = l;
    }
    if (nearest) {
      const centerX = bankX(y, 0, 0);
      const padSide: 1 | -1 = nearest.pad.x >= centerX ? 1 : -1;
      side = padSide === 1 ? -1 : 1;
    }
  }
  const bankGap = s.gap + 14 + (s.kind === "buffalo" ? 42 : 0) + (side === -1 ? 24 : 0);
  const x = s.kind === "lotus" ? bankX(y, side, 52) : bankX(y, side, bankGap);
  return {
    kind: s.kind,
    y,
    x,
    s: s.s,
    flip: s.flip,
  };
});
