import "server-only";
import {
  readdirSync,
  statSync,
  writeFileSync,
  unlinkSync,
  mkdirSync,
} from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import {
  commitFiles,
  deleteFile,
  ghJson,
  repoConfig,
  commitUrl,
  GitHubConfigError,
} from "@/lib/github";

import { MEDIA_FOLDERS, MAX_UPLOAD_BYTES } from "./media-shared";

/**
 * Media library IO. Images live under public/images/<folder>/ and are
 * committed like all other content (GitHub mode) or written to the working
 * tree (local dev). Raster formats only — SVG is excluded on purpose (script
 * injection vector for user-visible uploads).
 */

const RASTER_EXT = /\.(jpe?g|png|webp)$/i;
const LISTABLE_EXT = /\.(jpe?g|png|webp|svg)$/i;

export const uploadSchema = z.object({
  folder: z.enum(MEDIA_FOLDERS),
  fileName: z
    .string()
    .regex(
      /^[a-z0-9][a-z0-9-]{0,80}\.(jpg|jpeg|png|webp)$/,
      "kebab-case name with a raster extension",
    ),
  /** Base64 image payload (already resized client-side). */
  base64: z.string().min(1),
});

export interface MediaItem {
  /** Site path, e.g. /images/gallery/photo-1.jpg */
  path: string;
  /** Blob sha in GitHub mode (needed for delete); null locally. */
  sha: string | null;
  size: number;
}

const isGitHubMode = () =>
  Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);

export async function listMedia(): Promise<MediaItem[]> {
  if (isGitHubMode()) {
    const { repo, branch } = repoConfig();
    const tree = await ghJson<{
      tree: Array<{ path: string; type: string; sha: string; size?: number }>;
    }>(`/repos/${repo}/git/trees/${branch}?recursive=1`);
    return tree.tree
      .filter(
        (entry) =>
          entry.type === "blob" &&
          entry.path.startsWith("public/images/") &&
          LISTABLE_EXT.test(entry.path),
      )
      .map((entry) => ({
        path: entry.path.replace(/^public/, ""),
        sha: entry.sha,
        size: entry.size ?? 0,
      }))
      .sort((a, b) => a.path.localeCompare(b.path));
  }

  const root = join(process.cwd(), "public/images");
  const items: MediaItem[] = [];
  const walk = (dir: string, prefix: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const stat = statSync(full);
      if (stat.isDirectory()) walk(full, `${prefix}/${name}`);
      else if (LISTABLE_EXT.test(name)) {
        items.push({ path: `${prefix}/${name}`, sha: null, size: stat.size });
      }
    }
  };
  walk(root, "/images");
  return items.sort((a, b) => a.path.localeCompare(b.path));
}

export async function uploadMedia(
  input: z.infer<typeof uploadSchema>,
): Promise<{ path: string; mode: "github" | "local"; commitUrl?: string }> {
  const { folder, fileName, base64 } = uploadSchema.parse(input);
  const bytes = Math.floor(base64.length * 0.75);
  if (bytes > MAX_UPLOAD_BYTES) {
    throw new Error("Image is too large after processing (max 4 MB).");
  }

  const repoPath = `public/images/${folder}/${fileName}`;
  const sitePath = `/images/${folder}/${fileName}`;

  if (isGitHubMode()) {
    const { commitSha } = await commitFiles(
      [{ path: repoPath, content: base64, encoding: "base64" }],
      `content(media): add ${folder}/${fileName}`,
    );
    return { path: sitePath, mode: "github", commitUrl: commitUrl(commitSha) };
  }

  const dir = join(process.cwd(), "public/images", folder);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, fileName), Buffer.from(base64, "base64"));
  return { path: sitePath, mode: "local" };
}

export async function deleteMedia(input: {
  path: string;
  sha: string | null;
}): Promise<{ mode: "github" | "local" }> {
  // Site path only, no traversal, raster or svg.
  if (!/^\/images\/[a-z0-9/-]+\.[a-z]+$/i.test(input.path) || input.path.includes("..")) {
    throw new Error("Invalid media path.");
  }

  if (isGitHubMode()) {
    if (!input.sha) throw new GitHubConfigError("Missing file sha for delete.");
    await deleteFile({
      path: `public${input.path}`,
      message: `content(media): remove ${input.path.slice("/images/".length)}`,
      sha: input.sha,
    });
    return { mode: "github" };
  }

  unlinkSync(join(process.cwd(), "public", input.path));
  return { mode: "local" };
}

export { RASTER_EXT };
