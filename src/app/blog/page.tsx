import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/content/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing on building fast, distinctive, AI-forward web experiences.",
};

const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default async function BlogIndex() {
  const posts = await getPublishedPosts();
  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <header>
        <h1 className="text-4xl font-semibold tracking-tight">Writing</h1>
        <p className="mt-3 text-muted">
          Notes on the craft — quieter than the rest of the site.{" "}
          <a href="/feed.xml" className="underline hover:text-foreground">
            RSS
          </a>
        </p>
      </header>

      <ul className="mt-12 divide-y divide-border">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group block py-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted">
                <time dateTime={post.metadata.date}>
                  {dateFormat.format(new Date(post.metadata.date))}
                </time>
                <span aria-hidden="true">·</span>
                <span>{post.readingTimeMinutes} min read</span>
              </div>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent">
                {post.metadata.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {post.metadata.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
