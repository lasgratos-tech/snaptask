import type { Task } from "../domain/Task.types.js";
import type { TaskMutation } from "./taskMutations.js";
export declare function mutateTask(task: Task, mutation: TaskMutation): Task;
