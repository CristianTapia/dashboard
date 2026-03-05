import "server-only";

type Counter = {
  count: number;
  resetAt: number;
};

const counters = new Map<string, Counter>();

export function limitByKey(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const current = counters.get(key);

  if (!current || now > current.resetAt) {
    const resetAt = now + windowMs;
    counters.set(key, { count: 1, resetAt });
    return { ok: true, remaining: max - 1, resetAt };
  }

  if (current.count >= max) {
    return { ok: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  counters.set(key, current);
  return { ok: true, remaining: Math.max(0, max - current.count), resetAt: current.resetAt };
}
