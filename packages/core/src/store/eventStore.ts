import type { TaskEvent } from "../domain/TaskEvent.types.js";

/**
 * Event Store en mémoire (version 1)
 * Chaque action métier = un événement immuable
 */
class EventStore {
  private events: TaskEvent[] = [];

  append(event: TaskEvent): void {
    this.events.push(event);
  }

  getAll(): TaskEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}

export const eventStore = new EventStore();
