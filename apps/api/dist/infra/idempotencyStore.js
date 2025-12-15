class InMemoryIdempotencyStore {
    records = new Map();
    has(commandId) {
        return this.records.has(commandId);
    }
    get(commandId) {
        return this.records.get(commandId);
    }
    set(commandId, response) {
        this.records.set(commandId, {
            commandId,
            response,
            createdAt: Date.now()
        });
    }
}
export const idempotencyStore = new InMemoryIdempotencyStore();
//# sourceMappingURL=idempotencyStore.js.map