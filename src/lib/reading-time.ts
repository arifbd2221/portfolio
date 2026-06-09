/**
 * Rough reading-time estimate (minutes) from raw MDX source. Strips code
 * fences, ESM import/export lines, and Markdown punctuation, then counts words
 * at ~200 wpm. Good enough for a blog index badge.
 */
export function readingTime(raw: string): number {
  const text = raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/^\s*(import|export)\s.*$/gm, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~\-[\]()!]/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
