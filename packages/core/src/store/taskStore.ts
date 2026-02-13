import type { Task } from "../domain/Task.types.js";
import type { TaskEvent } from "../domain/TaskEvent.types.js";
import { replayTask } from "../engine/replayEngine.js";

export class TaskStore {
  private tasks = new Map<string, Task>();
  private events = new Map<string, TaskEvent[]>();
  private undone = new Map<string, TaskEvent[]>();

  create(task: Task) {
    this.tasks.set(task.id, task);
    this.events.set(task.id, []);
    this.undone.set(task.id, []);
  }

  append(event: TaskEvent) {
    const history = this.events.get(event.taskId);
    const undone = this.undone.get(event.taskId);
    const initial = this.tasks.get(event.taskId);

    if (!history || !undone || !initial) {
      throw new Error("Task not found");
    }

    history.push(event);
    undone.length = 0; // reset redo stack

    this.tasks.set(
      event.taskId,
      replayTask(initial, history)
    );
  }

  undo(taskId: string) {
    const history = this.events.get(taskId);
    const undone = this.undone.get(taskId);
    const initial = this.tasks.get(taskId);

    if (!history || !undone || !initial) {
      throw new Error("Task not found");
    }

    const event = history.pop();
    if (!event) return;

    undone.push(event);

    this.tasks.set(
      taskId,
      replayTask(initial, history)
    );
  }

  redo(taskId: string) {
    const history = this.events.get(taskId);
    const undone = this.undone.get(taskId);
    const initial = this.tasks.get(taskId);

    if (!history || !undone || !initial) {
      throw new Error("Task not found");
    }

    const event = undone.pop();
    if (!event) return;

    history.push(event);

    this.tasks.set(
      taskId,
      replayTask(initial, history)
    );
  }

  get(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  history(taskId: string): TaskEvent[] {
    return this.events.get(taskId) ?? [];
  }
}
