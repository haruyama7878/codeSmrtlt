import { db } from "@/db";
import { quizAttempts, users } from "@/db/schema";
import { and, desc, eq, gte, lt } from "drizzle-orm";
import { dailyActivity } from "@/db/schema";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const demoProfiles = {
  student: {
    email: "minhanh@smartlotus.edu.vn",
    displayName: "Nguyễn Minh Anh",
    avatar: "MA",
    lotusPoints: 1240,
    currentStreak: 5,
  },
  teacher: {
    email: "thuynguyen@smartlotus.edu.vn",
    displayName: "Cô Nguyễn Thuỷ",
    avatar: "NT",
    lotusPoints: 0,
    currentStreak: 12,
  },
  admin: {
    email: "admin@smartlotus.edu.vn",
    displayName: "Quản trị viên",
    avatar: "QT",
    lotusPoints: 0,
    currentStreak: 28,
  },
} as const;

type Role = keyof typeof demoProfiles;

async function getOrCreateDemoUser(role: Role) {
  const profile = demoProfiles[role];
  const [existing] = await db.select().from(users).where(eq(users.email, profile.email)).limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({ ...profile, role })
    .returning();
  return created;
}

export async function GET(request: NextRequest) {
  try {
    const requestedRole = request.nextUrl.searchParams.get("role") ?? "student";
    const role: Role = requestedRole in demoProfiles ? (requestedRole as Role) : "student";
    const user = await getOrCreateDemoUser(role);

    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, user.id))
      .orderBy(desc(quizAttempts.completedAt))
      .limit(8);

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayAttempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, user.id));
    const todayActivityRows = await db
      .select()
      .from(dailyActivity)
      .where(eq(dailyActivity.userId, user.id));

    const todayKey = new Date().toISOString().slice(0, 10);
    const todayActivity = todayActivityRows.find((activity) => activity.activityDate === todayKey);
    const todayCorrectAnswers = todayAttempts
      .filter((attempt) => attempt.completedAt >= todayStart)
      .reduce((sum, attempt) => sum + attempt.correctAnswers, 0);
    const lowScoreAttempts = await db
      .select({ id: quizAttempts.id })
      .from(quizAttempts)
      .where(and(eq(quizAttempts.userId, user.id), eq(quizAttempts.lessonSlug, "phep-cong-trong-pham-vi-10"), lt(quizAttempts.score, 50)));

    const weekStart = new Date();
    weekStart.setUTCHours(0, 0, 0, 0);
    weekStart.setUTCDate(weekStart.getUTCDate() - 6);
    const weeklyRows = await db
      .select({ userId: users.id, name: users.displayName, avatar: users.avatar, points: dailyActivity.pointsEarned })
      .from(dailyActivity)
      .innerJoin(users, eq(dailyActivity.userId, users.id))
      .where(gte(dailyActivity.activityDate, weekStart.toISOString().slice(0, 10)));
    const weeklyTotals = new Map<number, { name: string; avatar: string; points: number }>();
    for (const row of weeklyRows) {
      const current = weeklyTotals.get(row.userId);
      weeklyTotals.set(row.userId, { name: row.name, avatar: row.avatar, points: (current?.points ?? 0) + row.points });
    }
    if (!weeklyTotals.has(user.id)) weeklyTotals.set(user.id, { name: user.displayName, avatar: user.avatar, points: 0 });
    const weeklyLeaderboard = [...weeklyTotals.entries()]
      .map(([userId, profile]) => ({ ...profile, isCurrentUser: userId === user.id }))
      .sort((left, right) => right.points - left.points)
      .slice(0, 10);

    const averageScore = attempts.length
      ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.correctAnswers * 10, 0) / attempts.length)
      : 86;
    const learningMinutes = attempts.length
      ? Math.max(1, Math.round(attempts.reduce((sum, attempt) => sum + attempt.durationSeconds, 0) / 60))
      : 42;

    return Response.json({
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        lotusPoints: user.lotusPoints,
        currentStreak: user.currentStreak,
      },
      stats: {
        completedLessons: 14 + attempts.length,
        totalLessons: 40,
        averageScore,
        learningMinutes,
      },
      todayActivity: {
        minutesLearned: todayActivity?.minutesLearned ?? 0,
        lessonsCompleted: todayActivity?.lessonsCompleted ?? 0,
        pointsEarned: todayActivity?.pointsEarned ?? 0,
        correctAnswers: todayCorrectAnswers,
      },
      weeklyLeaderboard,
      lowScoreAttempts: lowScoreAttempts.length,
      recentAttempts: attempts.map((attempt) => ({
        id: attempt.id,
        lessonSlug: attempt.lessonSlug,
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        durationSeconds: attempt.durationSeconds,
        completedAt: attempt.completedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Dashboard API error", error);
    return Response.json({ message: "Không thể tải dữ liệu học tập" }, { status: 500 });
  }
}
