/**
 * 3D canvas mount point.
 *
 * Phase 0: a fixed, behind-everything placeholder layer that reserves the slot
 * without shipping any three.js to the client.
 *
 * Phase 2 swaps this for a lazy, client-only scene:
 *   const Scene = dynamic(() => import("./Scene"), { ssr: false, loading: () => <Loader /> })
 * loaded from a `"use client"` wrapper behind <Suspense>. The three.js bundle
 * must never block first paint.
 */
export function SceneMount() {
  return (
    <div
      aria-hidden="true"
      data-scene-mount
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
