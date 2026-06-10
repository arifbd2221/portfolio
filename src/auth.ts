import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

/**
 * Single-admin auth: GitHub OAuth (Auth.js v5), allowlisted to exactly one
 * GitHub username (ADMIN_GITHUB_LOGIN). Everyone else is denied at sign-in.
 *
 * Env (auto-inferred by the bare GitHub provider): AUTH_SECRET,
 * AUTH_GITHUB_ID, AUTH_GITHUB_SECRET — plus our ADMIN_GITHUB_LOGIN.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    signIn({ profile }) {
      const allowed = process.env.ADMIN_GITHUB_LOGIN;
      // `login` is the GitHub username on the OAuth profile.
      return Boolean(allowed && profile?.login === allowed);
    },
  },
  pages: {
    // Auth.js default pages are fine for a single-admin panel.
  },
});
