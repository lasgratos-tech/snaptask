import type { Task } from "../domain/Task.types.js";
import type { TaskEvent } from "../domain/TaskEvent.types.js";
import { applyMutation } from "./taskMutations.js";

/**
 * Rejoue une suite d'événements pour reconstruire
 * l'état final d'une Task (déterministe)
 */
export function replayTask(
  initial: Task,
  events: TaskEvent[]
): Task {
  return events.reduce((current, event) => {
    return applyMutation(current, event.mutation);
  }, initial);
}
