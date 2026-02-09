import type { FastifyPluginCallback } from "fastify";

import { registerTasksRoutes } from "./routes.js";

const tasksPlugin: FastifyPluginCallback = (app, _opts, done) => {
  app.addHook("preHandler", (request, reply, hookDone) => {
    const userId = request.headers["x-user-id"];
    if (typeof userId !== "string" || !userId.trim()) {
      reply.code(401).send({ error: "unauthorized" });
      return;
    }
    (request as { userId?: string }).userId = userId.trim();
    hookDone();
  });

  registerTasksRoutes(app);
  done();
};

export default tasksPlugin;
export { registerTasksRoutes } from "./routes.js";
export { createTask, getAllTasks, getTaskById } from "./service.js";
export { TaskSchema, TaskListSchema } from "./schema.js";
export type { CreateTaskInput, TaskStatus, TaskV5 } from "./types.js";
