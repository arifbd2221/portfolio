/**
 * Fallback shown while the lazy 3D Scene chunk loads (next/dynamic `loading`).
 * Renders outside the Canvas, so it's plain DOM. The spinner is auto-stilled
 * under prefers-reduced-motion by the global guard in globals.css.
 */
export function Loader() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div
        className="size-10 animate-spin rounded-full border-2 border-border border-t-accent"
        aria-hidden="true"
      />
      <span className="sr-only">Loading 3D scene…</span>
    </div>
  );
}
