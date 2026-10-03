// ─────────────────────────────────────────────────────────────
// MathQuest — core game logic: questions, ranks, leaderboards
// ─────────────────────────────────────────────────────────────

export type QuestionKind = "build" | "type" | "line" | "match" | "select";

interface BaseQ {
  id: string;
  kind: QuestionKind;
  prompt: string;
}

/** Gõ đáp án: 2 + 6 = □ */
export interface TypeQ extends BaseQ {
  kind: "type";
  a: number;
  op: "+" | "−" | "×";
  b: number;
  answer: number;
}

/** Hoàn thành phép tính: 6 = [5 + 1] ghép từ các ô */
export interface BuildQ extends BaseQ {
  kind: "build";
  target: number;
  tiles: string[];
  solution: string[];
}

/** Chọn số trên trục số: □ + 1 = 2 */
export interface LineQ extends BaseQ {
  kind: "line";
  b: number;
  c: number;
  max: number;
  answer: number;
}

/** Nối các cặp bằng nhau */
export interface MatchQ extends BaseQ {
  kind: "match";
  pairs: { left: string; right: string }[];
  rights: string[];
}

/** Chọn tất cả phép tính đúng: 12 = □ */
export interface SelectQ extends BaseQ {
  kind: "select";
  target: number;
  options: { expr: string; ok: boolean }[];
}

export type AnyQ = TypeQ | BuildQ | LineQ | MatchQ | SelectQ;

export type Phase = "answer" | "right" | "wrong";
export interface AnswerState {
  ready: boolean;
  correct: boolean;
  auto?: boolean;
}

// ── helpers ──────────────────────────────────────────────────
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + 1;
const sample = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

let uid = 0;
const nextId = () => `q${++uid}_${Math.random().toString(36).slice(2, 7)}`;

// ── question factories ───────────────────────────────────────
function makeType(): TypeQ {
  const op = sample(["+", "−", "×"] as const);
  let a = 0;
  let b = 0;
  let answer = 0;
  if (op === "+") {
    a = rand(1, 9);
    b = rand(1, 9);
    answer = a + b;
  } else if (op === "−") {
    a = rand(3, 12);
    b = rand(1, a - 1);
    answer = a - b;
  } else {
    a = rand(2, 6);
    b = rand(2, 6);
    answer = a * b;
  }
  return { id: nextId(), kind: "type", prompt: "Nhập đáp án", a, op, b, answer };
}

function makeBuild(): BuildQ {
  const usePlus = Math.random() < 0.5;
  let a: number, b: number, target: number;
  if (usePlus) {
    a = rand(2, 8);
    b = rand(2, 8);
    target = a + b;
  } else {
    a = rand(4, 12);
    b = rand(1, a - 2);
    target = a - b;
  }
  const op = usePlus ? "+" : "−";
  const otherOp = usePlus ? "−" : "+";
  const used = new Set<number>([a, b, target]);
  const distractors: string[] = [];
  let guard = 0;
  while (distractors.length < 3 && guard++ < 200) {
    const d = rand(1, 9);
    if (!used.has(d) && !distractors.includes(String(d))) distractors.push(String(d));
  }
  const tiles = shuffle([String(a), op, String(b), otherOp, ...distractors]);
  return {
    id: nextId(),
    kind: "build",
    prompt: "Hoàn thành phép tính",
    target,
    tiles,
    solution: [String(a), op, String(b)],
  };
}

/** Evaluate tile expression like ["5","+","1"] left-to-right. */
export function evalTokens(tokens: string[]): number | null {
  if (tokens.length < 3 || tokens.length % 2 === 0) return null;
  const isNum = (t: string) => /^\d+$/.test(t);
  if (!isNum(tokens[0])) return null;
  let acc = parseInt(tokens[0], 10);
  for (let i = 1; i < tokens.length - 1; i += 2) {
    const op = tokens[i];
    const n = tokens[i + 1];
    if (!isNum(n)) return null;
    const v = parseInt(n, 10);
    if (op === "+") acc += v;
    else if (op === "−") acc -= v;
    else return null;
  }
  return acc;
}

function makeLine(): LineQ {
  const c = rand(3, 9);
  const b = rand(1, c - 1);
  const answer = c - b;
  return {
    id: nextId(),
    kind: "line",
    prompt: "Trả lờii trên trục số".replace("lờii", "lờ" + "i"),
    b,
    c,
    max: Math.min(10, Math.max(6, c + 1)),
    answer,
  };
}

function makeMatch(): MatchQ {
  const bases = shuffle([2, 3, 4, 5, 6]).slice(0, 3);
  const pairs = bases.map((k) => ({
    left: `${k} + ${k} + ${k}`,
    right: String(k * 3),
  }));
  return {
    id: nextId(),
    kind: "match",
    prompt: "Nối các cặp bằng nhau",
    pairs,
    rights: shuffle(pairs.map((p) => p.right)),
  };
}

function makeSelect(): SelectQ {
  const factorMap: Record<number, [number, number][]> = {
    6: [
      [2, 3],
      [1, 6],
    ],
    8: [
      [2, 4],
      [1, 8],
    ],
    10: [
      [2, 5],
      [1, 10],
    ],
    12: [
      [2, 6],
      [3, 4],
    ],
    14: [
      [2, 7],
      [1, 14],
    ],
    15: [
      [3, 5],
      [1, 15],
    ],
    16: [
      [2, 8],
      [4, 4],
    ],
    18: [
      [2, 9],
      [3, 6],
    ],
    20: [
      [4, 5],
      [2, 10],
    ],
    24: [
      [3, 8],
      [4, 6],
    ],
  };
  const target = sample(Object.keys(factorMap).map(Number));
  const pairs = factorMap[target];
  const correct: string[] = pairs
    .filter(([x]) => x >= 2)
    .map(([x, y]) => `${x} · ${y}`);
  if (correct.length < 2) {
    const x = rand(3, target - 3);
    correct.push(`${x} + ${target - x}`);
  }

  const wrongPool: string[] = [];
  let guard = 0;
  while (wrongPool.length < 4 && guard++ < 300) {
    const mode = Math.random();
    let expr: string;
    let val: number;
    if (mode < 0.5) {
      const x = rand(2, 9);
      const y = rand(2, 9);
      val = x * y;
      expr = `${x} · ${y}`;
    } else if (mode < 0.75) {
      const x = rand(3, 9);
      const y = rand(2, 9);
      val = x + y;
      expr = `${x} + ${y}`;
    } else {
      const x = rand(2, 9);
      const y = rand(3, 9);
      if (x === y) continue;
      val = -999;
      expr = `${Math.min(x, y)} ÷ ${Math.max(x, y)}`;
    }
    if (val !== target && !correct.includes(expr) && !wrongPool.includes(expr)) wrongPool.push(expr);
  }
  const options = shuffle([
    ...correct.slice(0, 2).map((expr) => ({ expr, ok: true })),
    ...wrongPool.slice(0, 2).map((expr) => ({ expr, ok: false })),
  ]);
  return { id: nextId(), kind: "select", prompt: "Chọn tất cả phép tính đúng", target, options };
}

const FACTORIES: Record<QuestionKind, () => AnyQ> = {
  build: makeBuild,
  type: makeType,
  line: makeLine,
  match: makeMatch,
  select: makeSelect,
};

export function generateSession(count = 10): AnyQ[] {
  const guaranteed: QuestionKind[] = ["build", "type", "line", "match", "select"];
  const pool: QuestionKind[] = ["build", "type", "line", "select", "type", "build", "type", "line", "select", "type"];
  const kinds = shuffle([...guaranteed, ...shuffle(pool).slice(0, Math.max(0, count - guaranteed.length))]);
  return kinds.slice(0, count).map((k) => FACTORIES[k]());
}

export function solutionText(q: AnyQ): string {
  switch (q.kind) {
    case "type":
      return `${q.a} ${q.op} ${q.b} = ${q.answer}`;
    case "build":
      return `${q.target} = ${q.solution.join(" ")}`;
    case "line":
      return `${q.answer} + ${q.b} = ${q.c}`;
    case "select":
      return `${q.target} = ${q.options.filter((o) => o.ok).map((o) => o.expr).join(" = ")}`;
    case "match":
      return q.pairs.map((p) => `${p.left} = ${p.right}`).join(" • ");
  }
}

export const PRAISES = ["Xuất sắc!", "Chính xác!", "Tuyệt quá!", "Quá đỉnh!", "Chuẩn không cần chỉnh!", "Bạn thật siêu!"];
export const randomPraise = () => sample(PRAISES);

// ─────────────────────────────────────────────────────────────
// RANKS
// ─────────────────────────────────────────────────────────────
export interface RankDef {
  id: string;
  full: string;
  short: string;
  min: number;
  color: string;
  img: string;
  rule: string;
}

export const RANKS: RankDef[] = [
  { id: "bronze", full: "Giải Đồng", short: "Đồng", min: 0, color: "#D08A4E", img: "/ranks/bronze.png", rule: "Đứng trong Top 10 để thăng lên giải Bạc." },
  { id: "silver", full: "Giải Bạc", short: "Bạc", min: 100, color: "#B9C6D2", img: "/ranks/silver.png", rule: "Đứng trong Top 10 để thăng lên giải Vàng." },
  { id: "gold", full: "Giải Vàng", short: "Vàng", min: 250, color: "#FFC53D", img: "/ranks/gold.png", rule: "Đứng trong Top 10 để thăng lên giải Bạch Kim." },
  { id: "platinum", full: "Giải Bạch Kim", short: "Bạch Kim", min: 500, color: "#4FD6C4", img: "/ranks/platinum.png", rule: "Đứng trong Top 10 để thăng lên giải Kim Cương." },
  { id: "diamond", full: "Giải Kim Cương", short: "Kim Cương", min: 900, color: "#57A9FF", img: "/ranks/diamond.png", rule: "Lọt Top 100 giải Kim Cương để được phong THẦN ĐỒNG." },
  { id: "prodigy", full: "Thần Đồng", short: "Thần Đồng", min: Number.POSITIVE_INFINITY, color: "#C58BFF", img: "/ranks/prodigy.png", rule: "Danh hiệu cao quý nhất — chỉ dành cho 100 ngườ\u0069 giỏi nhất giải Kim Cương." },
];

/** Rank index by total XP (prodigy excluded — it's earned via league standing). */
export function rankIndexForXp(xp: number): number {
  let idx = 0;
  for (let i = 0; i < 5; i++) if (xp >= RANKS[i].min) idx = i;
  return idx;
}

// ─────────────────────────────────────────────────────────────
// LEADERBOARDS (deterministic fake players)
// ─────────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0) * 7, 13);

const LAST = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ"];
const GIVEN = [
  "Minh Anh", "Quốc Bảo", "Thu Hà", "Gia Huy", "Ngọc Lan", "Tuấn Kiệt", "Phương Thảo", "Đức Anh", "Hải Yến", "Trọng Nhân",
  "Mai Chi", "Bảo Ngọc", "Khánh Linh", "An Nhiên", "Hoàng Nam", "Thanh Tùng", "Diệu My", "Công Minh", "Hồng Sơn", "Kim Oanh",
  "Lan Anh", "Minh Triết", "Nhật Vy", "Phúc Lộc", "Quỳnh Chi", "Tâm An", "Thảo Nguyên", "Vĩnh Khang", "Yến Nhi", "Đăng Khoa",
  "Mỹ Duyên", "Nam Phong", "Bích Ngọc", "Hữu Phước", "Trúc Quỳnh", "Việt Anh", "Ngọc Hà", "Gia Bảo", "Khánh Vy", "Minh Quân",
];

const nameAt = (i: number) => `${LAST[Math.floor(i / GIVEN.length) % LAST.length]} ${GIVEN[i % GIVEN.length]}`;

export interface Row {
  name: string;
  xp: number;
  hue: number;
  you?: boolean;
}

function makeLeague(rankId: string, count: number, minXp: number, maxXp: number, topBias: number): Row[] {
  const rng = mulberry32(hash(rankId));
  const rows: Row[] = [];
  for (let i = 0; i < count; i++) {
    rows.push({
      name: nameAt(Math.floor(rng() * 400)),
      xp: Math.round(minXp + (maxXp - minXp) * Math.pow(rng(), topBias) / 5) * 5,
      hue: Math.floor(rng() * 360),
    });
  }
  rows.sort((a, b) => b.xp - a.xp);
  return rows;
}

/** Diamond ladder: 120 players, top ~5200 XP down to ~500 XP. Shared by Diamond + Prodigy views. */
export const DIAMOND_LADDER: Row[] = (() => {
  const rng = mulberry32(987654);
  const rows: Row[] = [];
  for (let i = 0; i < 120; i++) {
    const p = i / 119;
    const xp = 520 + Math.round((4680 * Math.pow(1 - p, 1.9) + rng() * 40) / 10) * 10;
    rows.push({ name: nameAt(i), xp, hue: Math.floor(rng() * 360) });
  }
  rows.sort((a, b) => b.xp - a.xp);
  return rows;
})();

const LEAGUE_TABLE: Record<string, Row[]> = {
  bronze: makeLeague("bronze", 30, 5, 95, 0.9),
  silver: makeLeague("silver", 30, 60, 270, 0.9),
  gold: makeLeague("gold", 30, 180, 470, 0.85),
  platinum: makeLeague("platinum", 30, 400, 780, 0.8),
  diamond: DIAMOND_LADDER,
};

export interface LeagueView {
  rows: Row[];
  youIndex: number; // -1 when not included
  promo: number; // size of promotion zone
  demo: number; // size of demotion zone
}

export function getLeague(rankId: string, weeklyXp: number, includeYou: boolean): LeagueView {
  const base = LEAGUE_TABLE[rankId] ?? LEAGUE_TABLE.bronze;
  const promo = rankId === "diamond" ? 100 : 10;
  const demo = rankId === "diamond" ? 0 : 5;
  const rows: Row[] = base.map((r) => ({ ...r }));
  let youIndex = -1;
  if (includeYou) {
    const you: Row = { name: "Bạn", xp: weeklyXp, hue: 205, you: true };
    rows.push(you);
    rows.sort((a, b) => b.xp - a.xp);
    youIndex = rows.findIndex((r) => r.you);
  }
  return { rows, youIndex, promo, demo };
}

/** Player's current standing (1-based) in the Diamond ladder by weekly XP. */
export function diamondPosition(weeklyXp: number): number {
  return DIAMOND_LADDER.filter((r) => r.xp > weeklyXp).length + 1;
}

export function isProdigy(totalXp: number, weeklyXp: number): boolean {
  return rankIndexForXp(totalXp) === 4 && diamondPosition(weeklyXp) <= 100;
}
