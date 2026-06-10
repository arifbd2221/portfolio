import { auth } from "@/auth";

/**
 * Next 16 route guard (the renamed middleware convention). Only matched paths
 * run through this. Unauthenticated requests to the admin area are redirected
 * to sign-in (pages) or rejected (APIs).
 *
 * Proxy is the optimistic outer layer only — every admin server surface ALSO
 * re-checks auth() itself (admin layout + each /api/admin handler).
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
