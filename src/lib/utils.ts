/**
 * Minimal className joiner. Filters out falsy values so conditional classes
 * read cleanly: cn("base", isActive && "active"). No external deps for now.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
