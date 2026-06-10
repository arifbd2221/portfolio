import "server-only";
import { auth } from "@/auth";
import { checkRateLimit } from "@/lib/rate-limit";

/** Auth check for read-only admin actions (e.g. status polling, listings). */
export async function requireAdminSession(): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

const ADMIN_WRITES_PER_MINUTE = 30;

/**
 * Auth + rate limit for WRITE actions (commits, uploads, deletes). The limit
 * is a runaway-loop backstop for a single human editor, not abuse protection —
 * unauthenticated traffic never gets this far.
 */
export async function requireAdminWrite(): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const key = session.user.email ?? session.user.name ?? "admin";
  const allowed = await checkRateLimit(key, {
    scope: "admin",
    limit: ADMIN_WRITES_PER_MINUTE,
  });
  if (!allowed) {
    throw new Error("Too many saves in a minute — pause briefly and retry.");
  }
}
