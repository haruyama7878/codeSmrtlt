import { StarIcon } from "./art";

export function Hud({
  level,
  stars,
  lotusPoints,
  streak,
}: {
  level: number;
  stars: number;
  lotusPoints: number;
  streak: number;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-50 px-3 pt-3">
      <div className="pointer-events-auto flex items-center gap-2">
        {/* avatar */}
        <button className="relative h-11 w-11 shrink-0 rounded-full border-[3px] border-white bg-gradient-to-b from-emerald-300 to-emerald-600 shadow-lg">
          <span className="grid h-full w-full place-items-center text-xl">🐸</span>
          <span className="absolute -bottom-1 -right-1 rounded-full bg-white px-1 text-[11px] font-extrabold text-emerald-700 shadow">
            {level}
          </span>
        </button>

        {/* stars */}
        <div className="flex h-9 items-center gap-1.5 rounded-full border-2 border-black/10 bg-black/35 px-3 backdrop-blur-md">
          <StarIcon className="h-5 w-5 text-amber-300" />
          <span className="text-[17px] font-extrabold text-white">{stars}</span>
        </div>

        {/* điểm sen */}
        <div className="flex h-9 items-center gap-1.5 rounded-full border-2 border-black/10 bg-black/35 px-3 backdrop-blur-md">
          <span className="text-[15px]">🌸</span>
          <span className="text-[17px] font-extrabold text-pink-100">{lotusPoints.toLocaleString("vi-VN")}</span>
        </div>

        <div className="flex-1" />

        {/* win streak */}
        <div className="flex h-9 items-center gap-1.5 rounded-full border-2 border-black/10 bg-black/35 px-3 backdrop-blur-md">
          <span className="text-[15px]">🔥</span>
          <span className="text-[17px] font-extrabold text-amber-300">{streak}</span>
        </div>
      </div>
    </div>
  );
}

export type TabId = "map" | "rank" | "quest" | "me";
