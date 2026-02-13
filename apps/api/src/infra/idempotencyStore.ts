type IdempotencyRecord = {
  commandId: string;
  response: unknown;
  createdAt: number;
};

class InMemoryIdempotencyStore {
  private records = new Map<string, IdempotencyRecord>();

  has(commandId: string): boolean {
    return this.records.has(commandId);
  }

  get(commandId: string): IdempotencyRecord | undefined {
    return this.records.get(commandId);
  }

  set(commandId: string, response: unknown) {
    this.records.set(commandId, {
      commandId,
      response,
      createdAt: Date.now()
    });
  }
}

export const idempotencyStore = new InMemoryIdempotencyStore();
