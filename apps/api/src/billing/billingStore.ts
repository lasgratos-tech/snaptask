type BillingEntry = {
  commandId: string;
  actorId: string;
  amount: number;
  currency: string;
  createdAt: number;
};

class InMemoryBillingStore {
  private entries: BillingEntry[] = [];

  add(entry: BillingEntry) {
    this.entries.push(entry);
  }

  totalForActor(actorId: string): number {
    return this.entries
      .filter(e => e.actorId === actorId)
      .reduce((sum, e) => sum + e.amount, 0);
  }
}

export const billingStore = new InMemoryBillingStore();
