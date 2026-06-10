import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/bio", label: "Bio" },
  { href: "/admin/story", label: "Story" },
  { href: "/admin/gallery", label: "Gallery" },
] as const;

/**
 * Admin chrome. This layout is the ENFORCED guard: it verifies the session
 * server-side on every /admin/* request and redirects out before rendering any
 * admin content (proxy.ts is only an optimistic outer net). Server actions
 * re-check auth independently.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/admin");
  }

  return (
    <div className="relative z-0 min-h-[calc(100dvh-65px)] bg-background">
      <div className="mx-auto flex w-full max-w-6xl gap-8 px-6 py-10">
        <aside className="w-44 shrink-0">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            Admin
          </p>
          <AdminNav items={[...NAV]} />

          <div className="mt-8 border-t border-border pt-4">
            <p className="truncate text-xs text-muted" title={session.user.name ?? ""}>
              {session.user.name}
            </p>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="mt-2 text-xs text-muted underline-offset-2 transition-colors hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
