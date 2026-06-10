import { auth } from "@/auth";

/**
 * Next 16 route guard (the proxy convention). This is an OPTIMISTIC outer
 * layer only — in practice the enforced admin boundary is:
 *   1. the admin layout (`await auth()` → redirect; verified in production), and
 *   2. every server action calling requireAdminSession/requireAdminWrite.
 * Server actions are the only write surface; there are no /api/admin routes.
 *
 * (Middleware/proxy execution is unreliable under the current Next 16 +
 * next-auth beta combo, so we never depend on it for security — only the inner
 * guards above, which run in the well-supported Node server context.)
 */
export const proxy = auth((req) => {
  if (req.auth) return;

  if (req.nextUrl.pathname.startsWith("/api/admin")) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const signInUrl = new URL("/api/auth/signin", req.nextUrl);
  signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
  return Response.redirect(signInUrl);
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
