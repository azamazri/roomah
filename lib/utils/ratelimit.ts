// lib/utils/ratelimit.ts
// In-memory (1 VPS instance) — cukup untuk Free Tier
const hits = new Map<string, { n: number; t: number }>();

export function allow(key: string, max = 5, windowMs = 60_000) {
  const now = Date.now();
  const v = hits.get(key);
  if (!v || now - v.t > windowMs) {
    hits.set(key, { n: 1, t: now });
    return true;
  }
  if (v.n >= max) return false;
  v.n += 1;
  return true;
}
