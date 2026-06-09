"use client";

import type { ReactNode } from "react";

/**
 * Lenis smooth-scroll provider.
 *
 * Phase 0: MOUNTED as a passthrough so the layout tree is final. The actual
 * Lenis instance, the GSAP ScrollTrigger sync, the scrollProgress → store
 * write, and the prefers-reduced-motion guard all land in Phase 1.
 *
 * Lenis must remain the ONE scroll source for the site — never pair it with
 * drei's <ScrollControls>, which would create a competing scroll container.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  // TODO(phase-1): initialize Lenis here, wire gsap.ticker → lenis.raf,
  // lenis.on('scroll', ScrollTrigger.update), and write scrollProgress to the store.
  return <>{children}</>;
}
