type CounterStore = Record<string, number>;
type TimingStore = Record<string, { count: number; sumMs: number }>;

const counters: CounterStore = {};
const timings: TimingStore = {};
const startedAt = Date.now();

export const inc = (metric: string, value = 1): void => {
  counters[metric] = (counters[metric] ?? 0) + value;
};

export const observe = (metric: string, valueMs: number): void => {
  const entry = timings[metric] ?? { count: 0, sumMs: 0 };
  entry.count += 1;
  entry.sumMs += valueMs;
  timings[metric] = entry;
};

export const snapshot = () => {
  const timingSnapshot: Record<string, { avgMs: number; count: number }> = {};
  Object.entries(timings).forEach(([metric, entry]) => {
    timingSnapshot[metric] = {
      avgMs: entry.count ? entry.sumMs / entry.count : 0,
      count: entry.count
    };
  });

  return {
    uptime: Date.now() - startedAt,
    counters: { ...counters },
    timings: timingSnapshot
  };
};
