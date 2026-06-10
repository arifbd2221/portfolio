import Link from "next/link";
import { listAdminPosts } from "@/lib/admin/posts";

// Always read the latest repo state — never a cached snapshot.
export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await listAdminPosts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="inline-flex h-9 items-center rounded-full bg-accent px-4 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No posts yet — write the first one.</p>
      ) : (
        <ul className="mt-6 divide-y divide-border">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/admin/posts/${post.slug}`}
                className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-surface/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {post.meta?.title ?? post.slug}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-muted">
                    {post.slug} · {post.meta?.date ?? "no date"}
                  </p>
                </div>
                {post.meta?.draft ? (
                  <span className="shrink-0 rounded-full border border-amber-500/50 px-2.5 py-0.5 text-xs text-amber-500">
                    Draft
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
                    Published
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
