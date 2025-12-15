import { replayTask } from "../engine/replayEngine.js";
export class TaskStore {
    constructor() {
        this.tasks = new Map();
        this.events = new Map();
        this.undone = new Map();
    }
    create(task) {
        this.tasks.set(task.id, task);
        this.events.set(task.id, []);
        this.undone.set(task.id, []);
    }
    append(event) {
        const history = this.events.get(event.taskId);
        const undone = this.undone.get(event.taskId);
        const initial = this.tasks.get(event.taskId);
        if (!history || !undone || !initial) {
            throw new Error("Task not found");
        }
        history.push(event);
        undone.length = 0; // reset redo stack
        this.tasks.set(event.taskId, replayTask(initial, history));
    }
    undo(taskId) {
        const history = this.events.get(taskId);
        const undone = this.undone.get(taskId);
        const initial = this.tasks.get(taskId);
        if (!history || !undone || !initial) {
            throw new Error("Task not found");
        }
        const event = history.pop();
        if (!event)
            return;
        undone.push(event);
        this.tasks.set(taskId, replayTask(initial, history));
    }
    redo(taskId) {
        const history = this.events.get(taskId);
        const undone = this.undone.get(taskId);
        const initial = this.tasks.get(taskId);
        if (!history || !undone || !initial) {
            throw new Error("Task not found");
        }
        const event = undone.pop();
        if (!event)
            return;
        history.push(event);
        this.tasks.set(taskId, replayTask(initial, history));
    }
    get(taskId) {
        return this.tasks.get(taskId);
    }
    history(taskId) {
        return this.events.get(taskId) ?? [];
    }
}
