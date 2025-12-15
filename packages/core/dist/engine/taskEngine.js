import { TaskSchema } from "../schemas/task.schema.js";
import { applyMutation } from "./taskMutations.js";
export function mutateTask(task, mutation) {
    TaskSchema.parse(task);
    const nextTask = applyMutation(task, mutation);
    TaskSchema.parse(nextTask);
    return nextTask;
}
