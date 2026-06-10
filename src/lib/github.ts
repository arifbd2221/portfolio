import "server-only";

/**
 * Minimal GitHub commit service for the git-backed admin (plain fetch — no
 * SDK). Every admin save becomes a commit on GITHUB_REPO/GITHUB_BRANCH and
 * Vercel redeploys. Token: fine-grained PAT, this repo only, Contents: write.
 *
 * - getFile/putFile: single-file reads/writes via the Contents API. The file
 *   `sha` must round-trip on update — a stale sha → 409 (optimistic locking),
 *   surfaced as GitHubConflictError so the UI can say "changed elsewhere".
 * - commitFiles: multi-file atomic commit via the Git Data API
 *   (blobs → tree → commit → ref).
 */

const API = "https://api.github.com";

export class GitHubConfigError extends Error {}
export class GitHubConflictError extends Error {}

function config() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) {
    throw new GitHubConfigError(
      "Admin publishing isn't configured — set GITHUB_TOKEN and GITHUB_REPO.",
    );
  }
  return { token, repo, branch: process.env.GITHUB_BRANCH ?? "main" };
}

async function gh(path: string, init?: RequestInit): Promise<Response> {
  const { token } = config();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
  return res;
}

export interface RepoFile {
  path: string;
  /** UTF-8 decoded content. */
  content: string;
  /** Blob sha — required to update this file. */
  sha: string;
}

export async function getFile(path: string): Promise<RepoFile | null> {
  const { repo, branch } = config();
  const res = await gh(`/repos/${repo}/contents/${path}?ref=${branch}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read failed (${res.status}) for ${path}`);
  const data = (await res.json()) as { content: string; sha: string };
  return {
    path,
    content: Buffer.from(data.content, "base64").toString("utf8"),
    sha: data.sha,
  };
}

export interface PutFileOptions {
  path: string;
  content: string;
  message: string;
  /** Required when updating an existing file; omit for creates. */
  sha?: string;
}

export async function putFile({
  path,
  content,
  message,
  sha,
}: PutFileOptions): Promise<{ commitSha: string; contentSha: string }> {
  const { repo, branch } = config();
  const res = await gh(`/repos/${repo}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (res.status === 409 || res.status === 422) {
    throw new GitHubConflictError(
      "The file changed since you loaded it — reload and re-apply your edit.",
    );
  }
  if (!res.ok) throw new Error(`GitHub write failed (${res.status}) for ${path}`);
  const data = (await res.json()) as {
    commit: { sha: string };
    content: { sha: string };
  };
  return { commitSha: data.commit.sha, contentSha: data.content.sha };
}

export async function deleteFile(opts: {
  path: string;
  message: string;
  sha: string;
}): Promise<void> {
  const { repo, branch } = config();
  const res = await gh(`/repos/${repo}/contents/${opts.path}`, {
    method: "DELETE",
    body: JSON.stringify({ message: opts.message, sha: opts.sha, branch }),
  });
  if (res.status === 409 || res.status === 422) {
    throw new GitHubConflictError(
      "The file changed since you loaded it — reload and retry.",
    );
  }
  if (!res.ok) {
    throw new Error(`GitHub delete failed (${res.status}) for ${opts.path}`);
  }
}

export interface CommitFileInput {
  path: string;
  /** utf-8 text, or base64 for binaries (set encoding). */
  content: string;
  encoding?: "utf-8" | "base64";
}

/**
 * One atomic commit containing several files (e.g. an image + the JSON that
 * references it). Git Data API: blobs → tree (base_tree) → commit → ref.
 * The ref update fails if the branch moved underneath us → conflict error.
 */
export async function commitFiles(
  files: CommitFileInput[],
  message: string,
): Promise<{ commitSha: string }> {
  const { repo, branch } = config();

  const refRes = await gh(`/repos/${repo}/git/ref/heads/${branch}`);
  if (!refRes.ok) throw new Error(`GitHub ref read failed (${refRes.status})`);
  const headSha = ((await refRes.json()) as { object: { sha: string } }).object
    .sha;

  const commitRes = await gh(`/repos/${repo}/git/commits/${headSha}`);
  if (!commitRes.ok) {
    throw new Error(`GitHub commit read failed (${commitRes.status})`);
  }
  const baseTree = ((await commitRes.json()) as { tree: { sha: string } }).tree
    .sha;

  const treeEntries = await Promise.all(
    files.map(async (file) => {
      const blobRes = await gh(`/repos/${repo}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({
          content: file.content,
          encoding: file.encoding ?? "utf-8",
        }),
      });
      if (!blobRes.ok) {
        throw new Error(`GitHub blob failed (${blobRes.status}) for ${file.path}`);
      }
      const blobSha = ((await blobRes.json()) as { sha: string }).sha;
      return { path: file.path, mode: "100644", type: "blob", sha: blobSha };
    }),
  );

  const treeRes = await gh(`/repos/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: baseTree, tree: treeEntries }),
  });
  if (!treeRes.ok) throw new Error(`GitHub tree failed (${treeRes.status})`);
  const treeSha = ((await treeRes.json()) as { sha: string }).sha;

  const newCommitRes = await gh(`/repos/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: treeSha, parents: [headSha] }),
  });
  if (!newCommitRes.ok) {
    throw new Error(`GitHub commit failed (${newCommitRes.status})`);
  }
  const newCommitSha = ((await newCommitRes.json()) as { sha: string }).sha;

  const updateRes = await gh(`/repos/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: newCommitSha }),
  });
  if (updateRes.status === 422) {
    throw new GitHubConflictError(
      "The branch moved while saving — reload and retry.",
    );
  }
  if (!updateRes.ok) {
    throw new Error(`GitHub ref update failed (${updateRes.status})`);
  }

  return { commitSha: newCommitSha };
}
