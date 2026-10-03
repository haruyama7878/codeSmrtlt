"use client";

import GameLevelMap from "../../ui_game_level/src/App";

type GameLevelMapProps = {
  onStartQuiz: (lessonNumber: number, mode: "normal" | "retry" | "hard") => void;
  initialCleared?: number;
  lotusPoints?: number;
};

export default function MathLevelMap({ onStartQuiz, initialCleared = 0, lotusPoints = 0 }: GameLevelMapProps) {
  return <GameLevelMap onStartQuiz={onStartQuiz} embedded initialCleared={initialCleared} lotusPoints={lotusPoints} />;
}
