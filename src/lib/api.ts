export type Role = "student" | "teacher" | "admin";

export type DashboardData = {
  user: {
    id: number;
    displayName: string;
    email: string;
    role: Role;
    avatar: string;
    avatarUrl?: string;
    lotusPoints: number;
    currentStreak: number;
  };
  stats: {
    completedLessons: number;
    totalLessons: number;
    averageScore: number;
    learningMinutes: number;
  };
  recentAttempts: Array<{
    id: number;
    lessonSlug: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    durationSeconds: number;
    completedAt: string;
  }>;
  todayActivity: {
    minutesLearned: number;
    lessonsCompleted: number;
    pointsEarned: number;
    correctAnswers: number;
  };
  weeklyLeaderboard: Array<{
    name: string;
    avatar: string;
    points: number;
    isCurrentUser: boolean;
  }>;
  lowScoreAttempts: number;
};

export type AttemptPayload = {
  lessonSlug: string;
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  durationSeconds: number;
  highestDifficulty: "A" | "B" | "C" | "D" | "E";
  answers: Array<{ questionId: number; answer: string; correct: boolean }>;
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "Không thể kết nối tới máy chủ");
  }

  return response.json() as Promise<T>;
}

export const smartLotusApi = {
  getDashboard(role: Role = "student") {
    return request<DashboardData>(`/api/dashboard?role=${role}`);
  },
  submitAttempt(payload: AttemptPayload) {
    return request<{ ok: true; attemptId: number; totalPoints: number }>("/api/attempts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  generateQuiz(input: { topic: string; curriculumLevel: number; difficulties: Array<"A" | "B" | "C" | "D" | "E">; count?: number; intelligenceScore?: number }) {
    return request<{ source: "ai" | "question-bank"; questions: import("./learning-data").QuizQuestion[] }>("/api/generate-quiz", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  evaluatePath(input: { placement: import("./placement").PlacementResult; attempts: import("./placement").AttemptSummary[] }) {
    return request<{ source: "ai" | "local"; evaluation: import("./placement").PathEvaluation }>("/api/evaluate-path", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  generateSurvey(count = 30) {
    return request<{ source: "ai" | "question-bank"; questions: import("./learning-data").SurveyQuestion[] }>("/api/generate-survey", {
      method: "POST",
      body: JSON.stringify({ count }),
    });
  },
  generateSurveyVariant(question: import("./learning-data").SurveyQuestion) {
    return request<{ source: "ai" | "local"; question: import("./learning-data").SurveyQuestion }>("/api/generate-survey-variant", {
      method: "POST",
      body: JSON.stringify({ question }),
    });
  },
};
