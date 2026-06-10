import "server-only";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { z } from "zod";
import { getFile, putFile, commitUrl } from "@/lib/github";
import { bioSchema } from "@/content/bio";
import { projectsSchema } from "@/content/projects";
import { storySchema } from "@/content/story";
import { galleryImageSchema } from "@/content/gallery";
import { z as zod } from "zod";

/**
 * Structured-content IO for the admin editors. Each named file maps to one
 * JSON document validated by the SAME zod schema the site itself parses with —
 * the admin literally cannot commit content the build would reject.
 *
 * GitHub mode reads/writes the repo (latest state + sha optimistic locking);
 * local mode uses the working tree.
 */

export const CONTENT_FILES = {
  bio: { path: "src/content/bio.json", schema: bioSchema },
  projects: { path: "src/content/projects.json", schema: projectsSchema },
  story: { path: "src/content/story.json", schema: storySchema },
  gallery: { path: "src/content/gallery.json", schema: zod.array(galleryImageSchema) },
} as const;

export type ContentName = keyof typeof CONTENT_FILES;
export type ContentData<N extends ContentName> = z.infer<
  (typeof CONTENT_FILES)[N]["schema"]
>;

const isGitHubMode = () =>
  Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);

export async function getContent<N extends ContentName>(
  name: N,
): Promise<{ data: ContentData<N>; sha: string | null }> {
  const { path, schema } = CONTENT_FILES[name];

  if (isGitHubMode()) {
    const file = await getFile(path);
    if (!file) throw new Error(`${path} missing from the repo.`);
    return {
      data: schema.parse(JSON.parse(file.content)) as ContentData<N>,
      sha: file.sha,
    };
  }

  const raw = readFileSync(join(process.cwd(), path), "utf8");
  return { data: schema.parse(JSON.parse(raw)) as ContentData<N>, sha: null };
}

export async function saveContent<N extends ContentName>(
  name: N,
  data: unknown,
  sha: string | null,
): Promise<{ mode: "github" | "local"; commitUrl?: string }> {
  const { path, schema } = CONTENT_FILES[name];
  const parsed = schema.parse(data);
  const serialized = `${JSON.stringify(parsed, null, 2)}\n`;

  if (isGitHubMode()) {
    const { commitSha } = await putFile({
      path,
      content: serialized,
      message: `content(${name}): update via admin`,
      sha: sha ?? undefined,
    });
    return { mode: "github", commitUrl: commitUrl(commitSha) };
  }

  writeFileSync(join(process.cwd(), path), serialized);
  return { mode: "local" };
}
