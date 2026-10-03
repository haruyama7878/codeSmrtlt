export type PlacementAnswer = {
  level: number;
  correct: boolean;
  retried: boolean;
};

export type PlacementResult = {
  /** Level bắt đầu học (1..6) */
  level: number;
  /** Chỉ số bài học bắt đầu trong level đó (0-based) */
  lessonIndex: number;
  /** Số câu đúng từng level, index 0 = Level 1 */
  perLevelCorrect: number[];
};

export type AttemptSummary = {
  lessonSlug: string;
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  durationSeconds?: number;
  completedAt?: string;
};

export type PathEvaluation = {
  /** Chỉ số tổng thông minh 0–100 */
  intelligenceScore: number;
  /** Level bắt đầu học hiện tại (1..6) */
  startLevel: number;
  /** Chỉ số bài học bắt đầu trong level (0-based) */
  lessonIndex: number;
  /** Các mức độ khó phù hợp cho cá nhân học sinh */
  recommendedDifficulties: Array<"A" | "B" | "C" | "D" | "E">;
  /** Đánh giá ngắn gọn bằng tiếng Việt */
  summary: string;
  /** Các gợi ý học tập */
  suggestions: string[];
};

const LEVEL_COUNT = 6;
const QUESTIONS_PER_LEVEL = 5;
/** Một level được coi là "đạt" khi đúng ít nhất 4/5 câu. */
export const PASS_THRESHOLD = 4;

export type Difficulty = "A" | "B" | "C" | "D" | "E";

/** Chọn các mức độ khó phù hợp với chỉ số thông minh 0–100. */
export function difficultiesForScore(score: number): Difficulty[] {
  if (score < 25) return ["A"];
  if (score < 45) return ["A", "B"];
  if (score < 60) return ["A", "B", "C"];
  if (score < 75) return ["B", "C", "D"];
  if (score < 90) return ["C", "D", "E"];
  return ["D", "E"];
}

/**
 * Tính điểm bắt đầu cho học sinh từ kết quả khảo sát 30 câu.
 * Học sinh bắt đầu từ level đầu tiên chưa đạt; trong level đó,
 * bắt đầu từ bài học thứ (số câu đúng trong level).
 */
export function computePlacement(answers: PlacementAnswer[]): PlacementResult {
  const perLevelCorrect = Array.from({ length: LEVEL_COUNT }, () => 0);
  for (const answer of answers) {
    if (answer.correct && answer.level >= 1 && answer.level <= LEVEL_COUNT) {
      perLevelCorrect[answer.level - 1] += 1;
    }
  }

  let level = 1;
  while (level < LEVEL_COUNT && perLevelCorrect[level - 1] >= PASS_THRESHOLD) {
    level += 1;
  }

  const lessonIndex = Math.max(0, Math.min(perLevelCorrect[level - 1], QUESTIONS_PER_LEVEL - 1));
  return { level, lessonIndex, perLevelCorrect };
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Đánh giá cục bộ (không cần AI): chỉ số tổng thông minh 0–100
 * = 70% từ kết quả khảo sát (trọng số theo level) + 30% từ lịch sử làm bài.
 */
export function evaluatePathLocal(placement: PlacementResult, attempts: AttemptSummary[]): PathEvaluation {
  const weights = [1, 2, 3, 4, 5, 6];
  const weightedTotal = weights.reduce((sum, weight) => sum + weight * QUESTIONS_PER_LEVEL, 0);
  let weightedCorrect = 0;
  placement.perLevelCorrect.forEach((correct, index) => {
    weightedCorrect += correct * weights[Math.min(index, weights.length - 1)];
  });
  const placementScore = (weightedCorrect / weightedTotal) * 70;

  const attemptScore = attempts.length
    ? (attempts.reduce((sum, attempt) => {
        const rate = attempt.totalQuestions > 0 ? attempt.correctAnswers / attempt.totalQuestions : 0;
        return sum + rate;
      }, 0) / attempts.length) * 30
    : 15;

  const intelligenceScore = clampScore(placementScore + attemptScore);
  const levelCorrect = placement.perLevelCorrect[placement.level - 1] ?? 0;
  return {
    intelligenceScore,
    startLevel: placement.level,
    lessonIndex: placement.lessonIndex,
    recommendedDifficulties: difficultiesForScore(intelligenceScore),
    summary:
      intelligenceScore >= 75
        ? "Học sinh có nền tảng tốt, sẵn sàng cho các bài nâng cao."
        : intelligenceScore >= 45
          ? "Học sinh nắm kiến thức cơ bản, cần luyện thêm các dạng vận dụng."
          : "Học sinh cần ôn lại kiến thức nền từ những bài đầu tiên.",
    suggestions:
      levelCorrect >= PASS_THRESHOLD
        ? ["Tiếp tục chinh phục các bài ở level hiện tại.", "Luyện thêm dạng toán có lời văn."]
        : ["Ôn lại các bài đầu của level hiện tại.", "Làm lại khảo sát sau 2 tuần để cập nhật lộ trình."],
  };
}
