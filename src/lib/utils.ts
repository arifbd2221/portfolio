/**
 * Minimal className joiner. Filters out falsy values so conditional classes
 * read cleanly: cn("base", isActive && "active"). No external deps for now.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Deterministic hue (0–359) from a string id — used for stable per-project
 * gradient placeholders (card cover and detail banner stay in sync).
 */
export function hueFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 360;
}
