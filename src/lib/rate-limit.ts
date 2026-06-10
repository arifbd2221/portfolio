import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const REQUESTS_PER_MINUTE = 12;

const hasUpstash = () =>
  Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );

/**
 * Distributed limiters — created lazily per scope when Upstash env vars are
 * present. Scopes keep the chat and admin windows independent.
 */
const upstashByScope = new Map<string, Ratelimit>();

function upstashLimiter(scope: string, limit: number): Ratelimit {
  let limiter = upstashByScope.get(scope);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, "1 m"),
      prefix: `portfolio-${scope}`,
      analytics: false,
    });
    upstashByScope.set(scope, limiter);
  }
  return limiter;
}

/**
 * In-memory sliding-window fallback. NOTE: per-instance — fine for local/dev
 * and single-instance deploys, but not for multi-instance production (use
 * Upstash there).
 */
const buckets = new Map<string, number[]>();
const WINDOW_MS = 60_000;

function inMemoryLimit(key: string, limit: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}

/**
 * Returns true if the request is allowed. `scope` separates limit pools
 * (chat vs admin); `limit` is requests per minute within the scope.
 */
export async function checkRateLimit(
  key: string,
  { scope = "chat", limit = REQUESTS_PER_MINUTE }: { scope?: string; limit?: number } = {},
): Promise<boolean> {
  if (hasUpstash()) {
    const { success } = await upstashLimiter(scope, limit).limit(key);
    return success;
  }
  return inMemoryLimit(`${scope}:${key}`, limit);
}
