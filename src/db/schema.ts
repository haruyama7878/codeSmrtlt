import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["student", "teacher", "admin"]);
export const difficultyEnum = pgEnum("difficulty", ["A", "B", "C", "D", "E"]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 120 }).notNull(),
    role: userRoleEnum("role").notNull().default("student"),
    avatar: varchar("avatar", { length: 12 }).notNull().default("MA"),
    lotusPoints: integer("lotus_points").notNull().default(0),
    currentStreak: integer("current_streak").notNull().default(1),
    longestStreak: integer("longest_streak").notNull().default(1),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)],
);

export const lessons = pgTable(
  "lessons",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull(),
    curriculumLevel: integer("curriculum_level").notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    topic: varchar("topic", { length: 180 }).notNull(),
    competency: text("competency").notNull(),
    questionCount: integer("question_count").notNull().default(10),
    published: boolean("published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("lessons_slug_idx").on(table.slug)],
);

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lessonSlug: varchar("lesson_slug", { length: 120 }).notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  totalQuestions: integer("total_questions").notNull().default(10),
  score: integer("score").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  highestDifficulty: difficultyEnum("highest_difficulty").notNull(),
  answers: jsonb("answers").$type<Array<{ questionId: number; answer: string; correct: boolean }>>().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
});

export const dailyActivity = pgTable(
  "daily_activity",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    activityDate: varchar("activity_date", { length: 10 }).notNull(),
    minutesLearned: integer("minutes_learned").notNull().default(0),
    lessonsCompleted: integer("lessons_completed").notNull().default(0),
    pointsEarned: integer("points_earned").notNull().default(0),
  },
  (table) => [uniqueIndex("daily_activity_user_date_idx").on(table.userId, table.activityDate)],
);

export type User = typeof users.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
