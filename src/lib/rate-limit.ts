import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const REQUESTS_PER_MINUTE = 12;

/**
 * Distributed limiter — used only when Upstash env vars are present.
 */
const upstash =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(REQUESTS_PER_MINUTE, "1 m"),
        prefix: "portfolio-chat",
        analytics: false,
      })
    : null;

/**
 * In-memory sliding-window fallback. NOTE: per-instance — fine for local/dev
 * and single-instance deploys, but not for multi-instance production (use
 * Upstash there). Keyed by IP.
 */
const buckets = new Map<string, number[]>();
const WINDOW_MS = 60_000;

function inMemoryLimit(key: string): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= REQUESTS_PER_MINUTE) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}

/** Returns true if the request is allowed. */
export async function checkRateLimit(key: string): Promise<boolean> {
  if (upstash) {
    const { success } = await upstash.limit(key);
    return success;
  }
  return inMemoryLimit(key);
}
