/**
 * Event Store en mémoire (version 1)
 * Chaque action métier = un événement immuable
 */
class EventStore {
    constructor() {
        this.events = [];
    }
    append(event) {
        this.events.push(event);
    }
    getAll() {
        return [...this.events];
    }
    clear() {
        this.events = [];
    }
}
export const eventStore = new EventStore();
