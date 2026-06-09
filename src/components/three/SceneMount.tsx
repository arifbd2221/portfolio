"use client";

import dynamic from "next/dynamic";
import { useIsHydrated } from "@/lib/use-is-hydrated";
import { useMediaQuery } from "@/lib/use-media-query";
import { HeroFallback } from "./HeroFallback";
import { Loader } from "./Loader";

/**
 * 3D canvas mount point — a fixed, behind-everything background layer.
 *
 * The Scene is lazy + client-only (ssr:false), so three.js never blocks first
 * paint and isn't in the initial JS payload (verified: it lives in a separate
 * chunk).
 *
 * Hydration strategy: the static <HeroFallback> poster is the universal
 * placeholder — rendered on the server, during hydration, and permanently for
 * reduced-motion / small touch devices. Only a hydrated, full-motion, capable
 * client flips to <Scene>, so:
 *   - server and hydration markup match exactly (no mismatch),
 *   - the Scene chunk is never even fetched when the fallback applies,
 *   - no-JS users see the poster, not a stuck spinner.
 */
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <Loader />,
});

export function SceneMount() {
  const isHydrated = useIsHydrated();
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isCoarsePointer = useMediaQuery("(pointer: coarse)");
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  const useFallback = prefersReducedMotion || (isCoarsePointer && isSmallScreen);
  const showScene = isHydrated && !useFallback;

  return (
    <div
      aria-hidden="true"
      data-scene-mount
      className="pointer-events-none fixed inset-0 -z-10"
    >
      {showScene ? <Scene /> : <HeroFallback />}
    </div>
  );
}
