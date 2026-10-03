import type { Chapter } from "../lib/map";
import DetailedScene from "./ChapterScenes";

const SCENES = [
  { sky: "#b9e9a3", ground: "#78c957", dark: "#3d8d55", ridge: "#4aa55f", accent: "#d7e995" },
  { sky: "#c4e9a8", ground: "#8fbd58", dark: "#608c46", ridge: "#6fae55", accent: "#e2ef9e" },
  { sky: "#aee09b", ground: "#67b06a", dark: "#39795a", ridge: "#5aa76a", accent: "#d3e9a2" },
  { sky: "#cfe9a2", ground: "#8fbf5e", dark: "#5c7c42", ridge: "#77b25e", accent: "#e4f2a4" },
  { sky: "#c6e8a5", ground: "#739c69", dark: "#466a59", ridge: "#6aa071", accent: "#dcebb0" },
  { sky: "#cde9a4", ground: "#6c914d", dark: "#3c6541", ridge: "#5f8f4d", accent: "#e2efae" },
  { sky: "#bfe6a0", ground: "#55ae78", dark: "#28775f", ridge: "#68c28a", accent: "#e0f2a9" },
  { sky: "#c8e9aa", ground: "#76a65c", dark: "#4a754e", ridge: "#5f9361", accent: "#dbeaa5" },
  { sky: "#cbe8a7", ground: "#6d9280", dark: "#47685d", ridge: "#5e9a6e", accent: "#dceec5" },
  { sky: "#cfe9a1", ground: "#71a256", dark: "#416b48", ridge: "#6fa25a", accent: "#e6f0a0" },
] as const;

export default function Scenery({ chapter }: { chapter: Chapter }) {
  // Chapters 4+ (Phố Cổ Hội An trở xuống) use detailed hand-drawn scenes
  if (chapter.id >= 4) return <DetailedScene chapter={chapter} />;

  const t = SCENES[chapter.id - 1] ?? SCENES[0];
  const id = `scene-${chapter.id}`;

  return (
    <svg width={430} height={chapter.height} viewBox={`0 0 430 ${chapter.height}`} preserveAspectRatio="none" className="absolute left-0 top-0">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.sky} />
          <stop offset="35%" stopColor={t.sky} />
          <stop offset="100%" stopColor={t.ground} />
        </linearGradient>
        <linearGradient id={`${id}-mist`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width={430} height={chapter.height} fill={`url(#${id}-sky)`} />

      <path d="M0 320 Q110 250 210 310 Q290 360 430 260 V720 H0 Z" fill={t.ridge} opacity="0.58" />
      <path d="M0 430 Q120 350 220 430 T430 395" fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="14" />
      <path d={`M0 600 Q120 520 220 610 Q330 700 430 580 V${chapter.height} H0 Z`} fill={t.dark} opacity="0.48" />
      <path d={`M0 760 Q110 680 220 760 Q330 840 430 720 V${chapter.height} H0 Z`} fill={t.ground} />
      <path d={`M0 ${chapter.height * 0.43} Q110 ${chapter.height * 0.41} 220 ${chapter.height * 0.44} T430 ${chapter.height * 0.42}`} stroke={`url(#${id}-mist)`} strokeWidth="30" fill="none" />
    </svg>
  );
}
