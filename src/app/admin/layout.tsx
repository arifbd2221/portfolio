import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/bio", label: "Bio" },
  { href: "/admin/story", label: "Story" },
  { href: "/admin/gallery", label: "Gallery" },
] as const;

/**
 * Admin chrome. Defense in depth: proxy.ts already guards /admin, but this
 * layout independently verifies the session server-side on every request.
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
          <nav aria-label="Admin" className="mt-4 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>

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
