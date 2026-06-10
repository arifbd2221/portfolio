import "server-only";
import { readdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import {
  getFile,
  putFile,
  deleteFile,
  GitHubConfigError,
} from "@/lib/github";

/**
 * Admin-side post IO. The editor works on the REPO state (latest commits),
 * not the deployed snapshot — so reads/writes go through the GitHub API when
 * GITHUB_TOKEN/GITHUB_REPO are set. Without them (local dev) it falls back to
 * the working tree on disk, so the admin is fully usable offline.
 */

const POSTS_DIR = "src/content/posts";
const localDir = () => join(process.cwd(), POSTS_DIR);

export const postMetaSchema = z.object({
  title: z.string().min(1).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().min(1).max(500),
  tags: z.array(z.string().min(1)).max(10),
  draft: z.boolean().optional().default(false),
});
export type AdminPostMeta = z.infer<typeof postMetaSchema>;

export const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "lowercase kebab-case only");

const isGitHubMode = () =>
  Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);

/**
 * The metadata block is canonical JSON inside the MDX (valid JS object
 * literal with quoted keys), so reading it back is a regex + JSON.parse —
 * no eval of repo content.
 */
const META_BLOCK = /export const metadata = (\{[\s\S]*?\});\s*\n?/;

export function parseMetadata(source: string): AdminPostMeta | null {
  const match = source.match(META_BLOCK);
  if (!match) return null;
  try {
    return postMetaSchema.parse(JSON.parse(match[1]));
  } catch {
    return null;
  }
}

export function splitBody(source: string): string {
  return source.replace(META_BLOCK, "").replace(/^\s*\n/, "");
}

export function serializePost(meta: AdminPostMeta, body: string): string {
  const json = JSON.stringify(meta, null, 2)
    .split("\n")
    .map((line, i) => (i === 0 ? line : `  ${line}`))
    .join("\n");
  return `export const metadata = ${json};\n\n${body.trim()}\n`;
}

export interface AdminPostListItem {
  slug: string;
  meta: AdminPostMeta | null;
}

export interface AdminPostFile {
  slug: string;
  source: string;
  /** GitHub blob sha when in GitHub mode; null in local mode. */
  sha: string | null;
}

async function listSlugsFromGitHub(): Promise<string[]> {
  const repo = process.env.GITHUB_REPO!;
  const branch = process.env.GITHUB_BRANCH ?? "main";
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/${POSTS_DIR}?ref=${branch}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error(`GitHub dir listing failed (${res.status})`);
  const entries = (await res.json()) as Array<{ name: string; type: string }>;
  return entries
    .filter((e) => e.type === "file" && e.name.endsWith(".mdx"))
    .map((e) => e.name.slice(0, -".mdx".length));
}

export async function listAdminPosts(): Promise<AdminPostListItem[]> {
  const slugs = isGitHubMode()
    ? await listSlugsFromGitHub()
    : readdirSync(localDir())
        .filter((f) => f.endsWith(".mdx"))
        .map((f) => f.slice(0, -".mdx".length));

  const items = await Promise.all(
    slugs.map(async (slug) => {
      const file = await getAdminPost(slug);
      return { slug, meta: file ? parseMetadata(file.source) : null };
    }),
  );

  return items.sort((a, b) =>
    (b.meta?.date ?? "").localeCompare(a.meta?.date ?? ""),
  );
}

export async function getAdminPost(
  slug: string,
): Promise<AdminPostFile | null> {
  slugSchema.parse(slug);
  if (isGitHubMode()) {
    const file = await getFile(`${POSTS_DIR}/${slug}.mdx`);
    return file ? { slug, source: file.content, sha: file.sha } : null;
  }
  try {
    const source = readFileSync(join(localDir(), `${slug}.mdx`), "utf8");
    return { slug, source, sha: null };
  } catch {
    return null;
  }
}

export async function saveAdminPost(opts: {
  slug: string;
  source: string;
  sha: string | null;
  isNew: boolean;
}): Promise<{ mode: "github" | "local" }> {
  slugSchema.parse(opts.slug);
  if (!parseMetadata(opts.source)) {
    throw new Error("Post metadata is missing or invalid.");
  }

  if (isGitHubMode()) {
    await putFile({
      path: `${POSTS_DIR}/${opts.slug}.mdx`,
      content: opts.source,
      message: `content(blog): ${opts.isNew ? "add" : "update"} ${opts.slug}`,
      sha: opts.sha ?? undefined,
    });
    return { mode: "github" };
  }

  writeFileSync(join(localDir(), `${opts.slug}.mdx`), opts.source);
  return { mode: "local" };
}

export async function deleteAdminPost(opts: {
  slug: string;
  sha: string | null;
}): Promise<{ mode: "github" | "local" }> {
  slugSchema.parse(opts.slug);

  if (isGitHubMode()) {
    if (!opts.sha) throw new GitHubConfigError("Missing file sha for delete.");
    await deleteFile({
      path: `${POSTS_DIR}/${opts.slug}.mdx`,
      message: `content(blog): remove ${opts.slug}`,
      sha: opts.sha,
    });
    return { mode: "github" };
  }

  unlinkSync(join(localDir(), `${opts.slug}.mdx`));
  return { mode: "local" };
}
