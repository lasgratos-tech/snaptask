import type { Task } from "../domain/Task.types.js";
import type { TaskEvent } from "../domain/TaskEvent.types.js";
export declare class TaskStore {
    private tasks;
    private events;
    private undone;
    create(task: Task): void;
    append(event: TaskEvent): void;
    undo(taskId: string): void;
    redo(taskId: string): void;
    get(taskId: string): Task | undefined;
    history(taskId: string): TaskEvent[];
}
