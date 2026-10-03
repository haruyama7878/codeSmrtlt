import type { QuizQuestion } from "./learning-data";

export const NORMAL_QUESTION_POINTS = 120;
export const CHALLENGE_QUESTION_POINTS = 80;
export const MAX_CHALLENGE_BONUS = 100;
export const CHALLENGE_BONUS_LIMIT_SECONDS = 180;

export function calculateQuestionScore(question: QuizQuestion, correct: boolean) {
  if (!correct) return 0;
  return question.phase === "normal" ? NORMAL_QUESTION_POINTS : CHALLENGE_QUESTION_POINTS;
}

export function calculateChallengeBonus(challengeSeconds: number) {
  const elapsed = Math.max(0, Math.min(CHALLENGE_BONUS_LIMIT_SECONDS, challengeSeconds));
  return Math.max(0, Math.round(MAX_CHALLENGE_BONUS * (1 - elapsed / CHALLENGE_BONUS_LIMIT_SECONDS)));
}

export function calculateQuizScore(normalCorrect: number, challengeCorrect: number, challengeSeconds: number) {
  const baseScore = normalCorrect * NORMAL_QUESTION_POINTS + challengeCorrect * CHALLENGE_QUESTION_POINTS;
  const bonus = challengeCorrect > 0 ? calculateChallengeBonus(challengeSeconds) : 0;
  return { baseScore, bonus, total: baseScore + bonus };
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
