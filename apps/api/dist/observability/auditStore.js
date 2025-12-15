class InMemoryAuditStore {
    entries = [];
    add(entry) {
        this.entries.push(entry);
    }
    all() {
        return this.entries;
    }
}
export const auditStore = new InMemoryAuditStore();
//# sourceMappingURL=auditStore.js.map