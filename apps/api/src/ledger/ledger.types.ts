export interface LedgerAccount {
  owner: string;
  balance: number;
}

export interface LedgerDebit {
  owner: string;
  amount: number;
  reason: string;
  timestamp: number;
}
