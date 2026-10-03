import type { SurveyQuestion } from "./learning-data";

export function isValidSurveyVariantInput(value: unknown): value is SurveyQuestion {
  if (!value || typeof value !== "object") return false;
  const question = value as Partial<SurveyQuestion>;
  return (
    typeof question.id === "number" &&
    typeof question.level === "number" &&
    question.level >= 1 &&
    question.level <= 6 &&
    typeof question.prompt === "string" &&
    Array.isArray(question.options) &&
    question.options.length === 4 &&
    question.options.every((option) => typeof option === "string") &&
    typeof question.correctAnswer === "string" &&
    question.options.includes(question.correctAnswer)
  );
}
