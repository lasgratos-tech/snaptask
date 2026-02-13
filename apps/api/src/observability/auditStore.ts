type AuditEntry = {
  commandId: string;
  actorId: string;
  commandName: string;
  status: 'accepted' | 'duplicate' | 'rejected';
  reason?: string;
  createdAt: number;
};

class InMemoryAuditStore {
  private entries: AuditEntry[] = [];

  add(entry: AuditEntry) {
    this.entries.push(entry);
  }

  all() {
    return this.entries;
  }
}

export const auditStore = new InMemoryAuditStore();
