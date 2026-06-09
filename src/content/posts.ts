import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ComponentType } from "react";
import { readingTime } from "@/lib/reading-time";

import HelloPost, { metadata as helloMeta } from "./posts/hello-world.mdx";

export interface PostMeta {
  title: string;
  date: string; // ISO (YYYY-MM-DD)
  description: string;
  tags: string[];
}

export interface Post {
  slug: string;
  metadata: PostMeta;
  Component: ComponentType;
  readingTimeMinutes: number;
}

const POSTS_DIR = join(process.cwd(), "src/content/posts");

function rt(slug: string): number {
  return readingTime(readFileSync(join(POSTS_DIR, `${slug}.mdx`), "utf8"));
}

/**
 * Post registry. Native MDX, no Contentlayer.
 * To add a post: create src/content/posts/<slug>.mdx exporting `metadata`,
 * then add an entry below. Sorted newest-first.
 */
export const posts: Post[] = [
  {
    slug: "hello-world",
    metadata: helloMeta,
    Component: HelloPost,
    readingTimeMinutes: rt("hello-world"),
  },
].sort(
  (a, b) =>
    new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime(),
);

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}
