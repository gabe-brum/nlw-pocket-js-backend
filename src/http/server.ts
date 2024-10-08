import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import dayjs from "dayjs";
import { createGoalRoute } from "./routes/create-goal";
import { createCompletionRoute } from "./routes/create-completion";
import { getPendingGoalsRoute } from "./routes/get-pending-goals";
import { getWeekSummaryRoute } from "./routes/get-week-summary";
import fastifyCors from "@fastify/cors";

const app = fastify().withTypeProvider<ZodTypeProvider>();

export const firstDayOfWeek = dayjs().startOf("week").toDate();
export const lastDayOfWeek = dayjs().endOf("week").toDate();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createGoalRoute);
app.register(createCompletionRoute);
app.register(getPendingGoalsRoute);
app.register(getWeekSummaryRoute);

app.register(fastifyCors, {
  origin: "*",
});

app
  .listen({
    host: "localhost",
    port: 3333,
  })
  .then(() => {
    console.log("HTTP Server Running");
  });
