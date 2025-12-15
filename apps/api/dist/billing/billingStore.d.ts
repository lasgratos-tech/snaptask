type BillingEntry = {
    commandId: string;
    actorId: string;
    amount: number;
    currency: string;
    createdAt: number;
};
declare class InMemoryBillingStore {
    private entries;
    add(entry: BillingEntry): void;
    totalForActor(actorId: string): number;
}
export declare const billingStore: InMemoryBillingStore;
export {};
