import type { TaskEvent } from "../domain/TaskEvent.types.js";
/**
 * Event Store en mémoire (version 1)
 * Chaque action métier = un événement immuable
 */
declare class EventStore {
    private events;
    append(event: TaskEvent): void;
    getAll(): TaskEvent[];
    clear(): void;
}
export declare const eventStore: EventStore;
export {};
