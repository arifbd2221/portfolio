import type { ReactNode } from "react";

/**
 * Callout box for MDX posts: <Callout>…</Callout> or <Callout type="warn">.
 * Sits inside `prose`, so the `not-prose` wrapper keeps prose styles from
 * fighting the box layout.
 */
export function Callout({
  children,
  type = "note",
}: {
  children: ReactNode;
  type?: "note" | "warn";
}) {
  const accent =
    type === "warn"
      ? "border-l-amber-500/70"
      : "border-l-accent";

  return (
    <div
      className={`not-prose my-6 flex gap-3 rounded-r-lg border border-l-4 border-border ${accent} bg-surface/50 p-4 text-sm leading-relaxed text-foreground/90`}
    >
      <span aria-hidden="true" className="select-none text-lg leading-none">
        {type === "warn" ? "⚠️" : "💡"}
      </span>
      <div className="[&>p]:m-0">{children}</div>
    </div>
  );
}
