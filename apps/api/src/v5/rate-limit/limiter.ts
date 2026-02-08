type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export class RateLimitError extends Error {
  constructor() {
    super('RATE_LIMIT_EXCEEDED');
  }
}

const store: Record<string, RateLimitEntry> = {};
const LIMIT = 100;
const WINDOW_MS = 60_000;

export const checkRateLimit = (ownerId: string): void => {
  const now = Date.now();
  const entry = store[ownerId];
  if (!entry || now >= entry.resetAt) {
    store[ownerId] = { count: 1, resetAt: now + WINDOW_MS };
    return;
  }
  if (entry.count >= LIMIT) {
    throw new RateLimitError();
  }
  entry.count += 1;
};
