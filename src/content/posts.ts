import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ComponentType } from "react";
import { readingTime } from "@/lib/reading-time";

export interface PostMeta {
  title: string;
  date: string; // ISO (YYYY-MM-DD)
  description: string;
  tags: string[];
  /** Drafts are visible only in the admin — never on the public site. */
  draft?: boolean;
}

export interface Post {
  slug: string;
  metadata: PostMeta;
  Component: ComponentType;
  readingTimeMinutes: number;
}

const POSTS_DIR = join(process.cwd(), "src/content/posts");

/**
 * Posts are AUTO-DISCOVERED from src/content/posts/*.mdx — no registry to
 * maintain; the admin (or you) just adds a file. The relative template-literal
 * import below is the documented Next/Turbopack context-module pattern (the
 * `@/` alias form is the historically flaky one — keep this path relative).
 */
export function getPostSlugs(): string[] {
  return readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.slice(0, -".mdx".length));
}

async function loadPost(slug: string): Promise<Post> {
  const mod = await import(`./posts/${slug}.mdx`);
  return {
    slug,
    metadata: mod.metadata,
    Component: mod.default,
    readingTimeMinutes: readingTime(
      readFileSync(join(POSTS_DIR, `${slug}.mdx`), "utf8"),
    ),
  };
}

/** Every post, drafts included — admin use. Sorted newest-first. */
export async function getAllPosts(): Promise<Post[]> {
  const posts = await Promise.all(getPostSlugs().map(loadPost));
  return posts.sort(
    (a, b) =>
      new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime(),
  );
}

/** Public surfaces (index, RSS, sitemap, chat prompt) — drafts excluded. */
export async function getPublishedPosts(): Promise<Post[]> {
  return (await getAllPosts()).filter((post) => !post.metadata.draft);
}

/** Slug is validated against the directory listing — never an open path. */
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  if (!getPostSlugs().includes(slug)) return undefined;
  return loadPost(slug);
}
