"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  postMetaSchema,
  slugSchema,
  serializePost,
  saveAdminPost,
  deleteAdminPost,
  getAdminPost,
  type AdminPostMeta,
} from "@/lib/admin/posts";
import { GitHubConflictError, GitHubConfigError } from "@/lib/github";

export interface ActionResult {
  ok: boolean;
  error?: string;
  /** "github" = committed (deploy pending); "local" = written to disk (dev). */
  mode?: "github" | "local";
}

async function requireAdmin(): Promise<true> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return true;
}

function errorMessage(err: unknown): string {
  if (err instanceof GitHubConflictError || err instanceof GitHubConfigError) {
    return err.message;
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}

export async function savePostAction(input: {
  slug: string;
  meta: AdminPostMeta;
  body: string;
  sha: string | null;
  isNew: boolean;
}): Promise<ActionResult> {
  try {
    await requireAdmin();
    const slug = slugSchema.parse(input.slug);
    const meta = postMetaSchema.parse(input.meta);

    if (input.isNew && (await getAdminPost(slug))) {
      return { ok: false, error: `A post with slug "${slug}" already exists.` };
    }

    const { mode } = await saveAdminPost({
      slug,
      source: serializePost(meta, input.body),
      sha: input.sha,
      isNew: input.isNew,
    });

    revalidatePath("/admin/posts");
    if (mode === "local") {
      revalidatePath("/blog");
      revalidatePath(`/blog/${slug}`);
    }
    return { ok: true, mode };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

export async function deletePostAction(input: {
  slug: string;
  sha: string | null;
}): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { mode } = await deleteAdminPost({
      slug: slugSchema.parse(input.slug),
      sha: input.sha,
    });
    revalidatePath("/admin/posts");
    if (mode === "local") revalidatePath("/blog");
    return { ok: true, mode };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}
