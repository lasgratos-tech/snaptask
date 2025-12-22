interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 30;

const BUCKETS = new Map<string, RateLimitRecord>();

export function checkRateLimit(key: string) {
  const now = Date.now();
  const record = BUCKETS.get(key);

  if (!record || record.resetAt <= now) {
    BUCKETS.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS - record.count,
  };
}
