import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { createGoal } from "../functions/create-goal";
import z from "zod";
import { getWeekPendingGoals } from "../functions/get-week-pending-goals";
import dayjs from "dayjs";
import { createGoalCompletion } from "../functions/create-goal-completion";

const app = fastify().withTypeProvider<ZodTypeProvider>();

export const firstDayOfWeek = dayjs().startOf("week").toDate();
export const lastDayOfWeek = dayjs().endOf("week").toDate();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.get("/pending-goals", async () => {
  const { pendingGoals } = await getWeekPendingGoals();

  return {
    pendingGoals,
  };
});

app.post(
  "/completions",
  {
    schema: {
      body: z.object({
        goalId: z.string(),
      }),
    },
  },
  async (request) => {
    const { goalId } = request.body;

    await createGoalCompletion({
      goalId,
    });
  }
);

app.post(
  "/goals",
  {
    schema: {
      body: z.object({
        title: z.string(),
        desiredWeeklyFrequency: z.number().int().min(1).max(7),
      }),
    },
  },
  async (request) => {
    const { title, desiredWeeklyFrequency } = request.body;

    await createGoal({
      title,
      desiredWeeklyFrequency,
    });
  }
);

app
  .listen({
    host: "localhost",
    port: 3333,
  })
  .then(() => {
    console.log("HTTP Server Running");
  });
