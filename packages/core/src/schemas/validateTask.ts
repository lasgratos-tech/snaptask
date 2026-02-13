import { TaskSchema } from "./task.schema.js";
import type { Task } from "../domain/Task.types.js";

export function validateTask(input: unknown): Task {
  const result = TaskSchema.safeParse(input);

  if (!result.success) {
    throw new Error(
      "Invalid Task:\n" + JSON.stringify(result.error.format(), null, 2)
    );
  }

  return result.data;
}
