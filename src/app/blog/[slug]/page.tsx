import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPosts, getPostBySlug } from "@/content/posts";
import { JsonLd } from "@/components/json-ld";
import { bio } from "@/content/bio";
import { siteUrl } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.metadata.draft) return {};
  const { title, description } = post.metadata;
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
  };
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  // Drafts are admin-only — the public route treats them as missing.
  if (!post || post.metadata.draft) notFound();

  const { Component, metadata } = post;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: metadata.title,
    description: metadata.description,
    datePublished: metadata.date,
    keywords: metadata.tags.join(", "),
    url: `${siteUrl}/blog/${post.slug}`,
    author: { "@type": "Person", name: bio.name },
  };

  return (
    <article className="mx-auto max-w-2xl px-6 py-24">
      <JsonLd data={articleLd} />
      <Link
        href="/blog"
        className="text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        ← All posts
      </Link>

      <header className="mt-8">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted">
          <time dateTime={metadata.date}>
            {dateFormat.format(new Date(metadata.date))}
          </time>
          <span aria-hidden="true">·</span>
          <span>{post.readingTimeMinutes} min read</span>
        </div>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight">
          {metadata.title}
        </h1>
        <ul className="mt-4 flex flex-wrap gap-2">
          {metadata.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      </header>

      <div className="prose prose-zinc mt-12 max-w-none dark:prose-invert prose-pre:rounded-xl prose-pre:border prose-pre:border-border">
        <Component />
      </div>
    </article>
  );
}
