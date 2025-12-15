class InMemoryBillingStore {
    entries = [];
    add(entry) {
        this.entries.push(entry);
    }
    totalForActor(actorId) {
        return this.entries
            .filter(e => e.actorId === actorId)
            .reduce((sum, e) => sum + e.amount, 0);
    }
}
export const billingStore = new InMemoryBillingStore();
//# sourceMappingURL=billingStore.js.map