import type { Task } from "../domain/Task.types.js";
import { TaskSchema } from "../schemas/task.schema.js";
import type { TaskMutation } from "./taskMutations.js";
import { applyMutation } from "./taskMutations.js";


export function mutateTask(
  task: Task,
  mutation: TaskMutation
): Task {
  TaskSchema.parse(task);

  const nextTask = applyMutation(task, mutation);

  TaskSchema.parse(nextTask);

  return nextTask;
}
