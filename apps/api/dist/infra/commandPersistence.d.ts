export declare function persistCommandAndEvents(params: {
    commandId: string;
    commandName: string;
    actorId: string;
    payload?: unknown;
    events: Array<{
        aggregateId: string;
        eventType: string;
        payload: unknown;
    }>;
}): Promise<void>;
