import { count, gte, lte, and, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { goalCompletions, goals } from "../db/schema";
import { firstDayOfWeek, lastDayOfWeek } from "../http/server";

interface CreateGoalCompletionRequest {
  goalId: string;
}

export async function createGoalCompletion({
  goalId,
}: CreateGoalCompletionRequest) {
  const goalsCompletionCounts = db.$with("goal_completion_counts").as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.goalId).as("completionCount"),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek),
          eq(goalCompletions.goalId, goalId)
        )
      )
      .groupBy(goalCompletions.goalId)
  );

  const result = await db
    .with(goalsCompletionCounts)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount:
        sql`COALESCE(${goalsCompletionCounts.completionCount}, 0)`.mapWith(
          Number
        ),
    })
    .from(goals)
    .leftJoin(goalsCompletionCounts, eq(goalsCompletionCounts.goalId, goals.id))
    .where(eq(goals.id, goalId));

  const { completionCount, desiredWeeklyFrequency } = result[0];

  if (completionCount >= desiredWeeklyFrequency) {
    throw new Error("Goal already completed this week");
  }

  const insertResult = await db
    .insert(goalCompletions)
    .values({ goalId })
    .returning();
  const goalCompletion = insertResult[0];

  return { goalCompletion };
}
