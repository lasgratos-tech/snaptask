type IdempotencyRecord = {
    commandId: string;
    response: unknown;
    createdAt: number;
};
declare class InMemoryIdempotencyStore {
    private records;
    has(commandId: string): boolean;
    get(commandId: string): IdempotencyRecord | undefined;
    set(commandId: string, response: unknown): void;
}
export declare const idempotencyStore: InMemoryIdempotencyStore;
export {};
