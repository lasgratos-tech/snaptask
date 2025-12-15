export type StoredEvent = {
    eventId: string;
    commandId: string;
    aggregateId: string;
    eventType: string;
    payload: unknown;
};
export declare function appendEvent(commandId: string, aggregateId: string, eventType: string, payload: unknown): Promise<`${string}-${string}-${string}-${string}-${string}`>;
export declare function loadEvents(aggregateId: string): Promise<any>;
