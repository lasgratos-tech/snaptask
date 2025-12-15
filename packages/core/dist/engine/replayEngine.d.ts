import type { Task } from "../domain/Task.types.js";
import type { TaskEvent } from "../domain/TaskEvent.types.js";
/**
 * Rejoue une suite d'événements pour reconstruire
 * l'état final d'une Task (déterministe)
 */
export declare function replayTask(initial: Task, events: TaskEvent[]): Task;
