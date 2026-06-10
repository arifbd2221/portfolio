"use server";

import { revalidatePath } from "next/cache";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { auth } from "@/auth";
import {
  listMedia,
  uploadMedia,
  deleteMedia,
  uploadSchema,
  type MediaItem,
} from "@/lib/admin/media";
import {
  saveContent,
  type ContentName,
  CONTENT_FILES,
} from "@/lib/admin/content";
import {
  commitFiles,
  GitHubConflictError,
  GitHubConfigError,
} from "@/lib/github";

export interface AdminActionResult<T = undefined> {
  ok: boolean;
  error?: string;
  mode?: "github" | "local";
  data?: T;
}

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

function message(err: unknown): string {
  if (err instanceof GitHubConflictError || err instanceof GitHubConfigError) {
    return err.message;
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}

export async function listMediaAction(): Promise<AdminActionResult<MediaItem[]>> {
  try {
    await requireAdmin();
    return { ok: true, data: await listMedia() };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function uploadMediaAction(input: {
  folder: string;
  fileName: string;
  base64: string;
}): Promise<AdminActionResult<{ path: string }>> {
  try {
    await requireAdmin();
    const parsed = uploadSchema.parse(input);
    const { path, mode } = await uploadMedia(parsed);
    revalidatePath("/admin/media");
    return { ok: true, mode, data: { path } };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function deleteMediaAction(input: {
  path: string;
  sha: string | null;
}): Promise<AdminActionResult> {
  try {
    await requireAdmin();
    const { mode } = await deleteMedia(input);
    revalidatePath("/admin/media");
    return { ok: true, mode };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function saveContentAction(input: {
  name: ContentName;
  data: unknown;
  sha: string | null;
}): Promise<AdminActionResult> {
  try {
    await requireAdmin();
    if (!(input.name in CONTENT_FILES)) throw new Error("Unknown content file.");
    const { mode } = await saveContent(input.name, input.data, input.sha);
    if (mode === "local") revalidatePath("/", "layout");
    revalidatePath(`/admin/${input.name === "bio" ? "bio" : input.name}`);
    return { ok: true, mode };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

const MAX_RESUME_BYTES = 8 * 1024 * 1024;

export async function uploadResumeAction(input: {
  base64: string;
}): Promise<AdminActionResult> {
  try {
    await requireAdmin();
    const buffer = Buffer.from(input.base64, "base64");
    if (buffer.length > MAX_RESUME_BYTES) {
      throw new Error("Resume is too large (max 8 MB).");
    }
    if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
      throw new Error("Resume must be a PDF file.");
    }

    if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
      await commitFiles(
        [{ path: "public/resume.pdf", content: input.base64, encoding: "base64" }],
        "content(bio): update resume",
      );
      return { ok: true, mode: "github" };
    }

    writeFileSync(join(process.cwd(), "public/resume.pdf"), buffer);
    return { ok: true, mode: "local" };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}
