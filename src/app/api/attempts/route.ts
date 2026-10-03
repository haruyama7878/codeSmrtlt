import { db } from "@/db";
import { dailyActivity, quizAttempts, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const studentEmail = "minhanh@smartlotus.edu.vn";

function isValidDifficulty(value: unknown): value is "A" | "B" | "C" | "D" | "E" {
  return typeof value === "string" && ["A", "B", "C", "D", "E"].includes(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (
      typeof body.lessonSlug !== "string" ||
      typeof body.correctAnswers !== "number" ||
      typeof body.totalQuestions !== "number" ||
      typeof body.score !== "number" ||
      typeof body.durationSeconds !== "number" ||
      !isValidDifficulty(body.highestDifficulty) ||
      !Array.isArray(body.answers)
    ) {
      return Response.json({ message: "Dữ liệu bài làm không hợp lệ" }, { status: 400 });
    }

    let [student] = await db.select().from(users).where(eq(users.email, studentEmail)).limit(1);
    if (!student) {
      [student] = await db
        .insert(users)
        .values({
          email: studentEmail,
          displayName: "Nguyễn Minh Anh",
          avatar: "MA",
          role: "student",
          lotusPoints: 1240,
          currentStreak: 5,
        })
        .returning();
    }

    const safeScore = Math.max(0, Math.min(1750, Math.round(body.score)));
    const safeDuration = Math.max(1, Math.min(3600, Math.round(body.durationSeconds)));
    const safeCorrect = Math.max(0, Math.min(body.totalQuestions, Math.round(body.correctAnswers)));

    const [attempt] = await db
      .insert(quizAttempts)
      .values({
        userId: student.id,
        lessonSlug: body.lessonSlug,
        correctAnswers: safeCorrect,
        totalQuestions: Math.max(1, Math.min(20, Math.round(body.totalQuestions))),
        score: safeScore,
        durationSeconds: safeDuration,
        highestDifficulty: body.highestDifficulty,
        answers: body.answers,
      })
      .returning({ id: quizAttempts.id });

    await db
      .update(users)
      .set({
        lotusPoints: sql`${users.lotusPoints} + ${safeScore}`,
        lastActiveAt: new Date(),
      })
      .where(eq(users.id, student.id));

    const today = new Date().toISOString().slice(0, 10);
    await db
      .insert(dailyActivity)
      .values({
        userId: student.id,
        activityDate: today,
        minutesLearned: Math.max(1, Math.round(safeDuration / 60)),
        lessonsCompleted: 1,
        pointsEarned: safeScore,
      })
      .onConflictDoUpdate({
        target: [dailyActivity.userId, dailyActivity.activityDate],
        set: {
          minutesLearned: sql`${dailyActivity.minutesLearned} + ${Math.max(1, Math.round(safeDuration / 60))}`,
          lessonsCompleted: sql`${dailyActivity.lessonsCompleted} + 1`,
          pointsEarned: sql`${dailyActivity.pointsEarned} + ${safeScore}`,
        },
      });

    const [updated] = await db.select({ lotusPoints: users.lotusPoints }).from(users).where(eq(users.id, student.id));
    return Response.json({ ok: true, attemptId: attempt.id, totalPoints: updated.lotusPoints });
  } catch (error) {
    console.error("Attempt API error", error);
    return Response.json({ message: "Chưa thể lưu kết quả bài làm" }, { status: 500 });
  }
}
