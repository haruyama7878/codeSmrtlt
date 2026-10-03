import { decor } from "../lib/map";
import {
  Boat,
  Bridge,
  Buffalo,
  Carp,
  Crab,
  Duck,
  Lantern,
  LilyClump,
  Lotus,
  Pagoda,
  RedBridge,
  Reed,
  Rock,
  Tree,
} from "./art";

const ART = {
  buffalo: Buffalo,
  boat: Boat,
  pagoda: Pagoda,
  tree: Tree,
  lotus: Lotus,
  reed: Reed,
  rock: Rock,
  lantern: Lantern,
  lilyclump: LilyClump,
  bridge: Bridge,
  redbridge: RedBridge,
  duck: Duck,
  carp: Carp,
  crab: Crab,
} as const;

const SIZE: Record<keyof typeof ART, number> = {
  buffalo: 116,
  boat: 122,
  pagoda: 96,
  tree: 104,
  lotus: 62,
  reed: 58,
  rock: 72,
  lantern: 54,
  lilyclump: 92,
  bridge: 300,
  redbridge: 250,
  duck: 72,
  carp: 88,
  crab: 66,
};

export default function DecorLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {decor.map((d, i) => {
        const Art = ART[d.kind];
        const size = SIZE[d.kind] * d.s;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: d.x,
              top: d.y,
              width: size,
              height: size,
              transform: `translate(-50%, -50%) ${d.flip ? "scaleX(-1)" : ""}`,
            }}
          >
            <div className={d.kind === "lantern" ? "anim-float" : "anim-bob-slow"}>
              <Art className="h-full w-full drop-shadow-[0_6px_8px_rgba(0,0,0,0.25)]" />
            </div>
          </div>
        );
      })}

    </div>
  );
}
