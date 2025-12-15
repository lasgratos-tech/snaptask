type AuditEntry = {
    commandId: string;
    actorId: string;
    commandName: string;
    status: 'accepted' | 'duplicate' | 'rejected';
    reason?: string;
    createdAt: number;
};
declare class InMemoryAuditStore {
    private entries;
    add(entry: AuditEntry): void;
    all(): AuditEntry[];
}
export declare const auditStore: InMemoryAuditStore;
export {};
