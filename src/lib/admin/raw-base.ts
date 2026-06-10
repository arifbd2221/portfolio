import "server-only";

/**
 * Base URL for reading repo files directly (thumbnails/probes of images that
 * are committed but not yet deployed). Public repo only — null in local mode.
 */
export function rawBase(): string | null {
  const repo = process.env.GITHUB_REPO;
  if (!process.env.GITHUB_TOKEN || !repo) return null;
  const branch = process.env.GITHUB_BRANCH ?? "main";
  return `https://raw.githubusercontent.com/${repo}/${branch}`;
}
