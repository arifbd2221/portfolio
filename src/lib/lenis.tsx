"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAppStore } from "@/lib/store";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

/**
 * Programmatic scroll. Uses Lenis when smooth scroll is active; falls back to
 * native scrolling under prefers-reduced-motion (when no Lenis instance exists).
 * This is the single API the rest of the app (nav, the AI's navigateTo tool in
 * Phase 7) uses to move the page.
 */
export type ScrollToTarget = number | string | HTMLElement;
export interface ScrollToOptions {
  offset?: number;
  duration?: number;
  immediate?: boolean;
}
type ScrollToFn = (target: ScrollToTarget, options?: ScrollToOptions) => void;

const LenisScrollContext = createContext<ScrollToFn | null>(null);

/** Access the programmatic scroll function from anywhere under the provider. */
export function useScrollTo(): ScrollToFn {
  const ctx = useContext(LenisScrollContext);
  if (!ctx) {
    throw new Error("useScrollTo must be used within <LenisProvider>");
  }
  return ctx;
}

/**
 * The single smooth-scroll source for the site.
 *
 * - Initializes Lenis once and drives it from GSAP's ticker (one rAF loop), so
 *   ScrollTrigger and Lenis never fight over scroll timing.
 * - Writes scrollProgress (0→1 over the whole page) to the store via a
 *   document-spanning ScrollTrigger — which works whether scrolling is driven
 *   by Lenis or natively.
 * - Under prefers-reduced-motion, Lenis is never created: the page uses native
 *   scrolling, while the store bus (scrollProgress / activeSection) keeps working.
 *
 * Never pair this with drei's <ScrollControls> — that would create a competing
 * scroll container.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const setScrollProgress = useAppStore((s) => s.setScrollProgress);
  const lenisRef = useRef<Lenis | null>(null);

  const scrollTo = useCallback<ScrollToFn>((target, options) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, options);
      return;
    }
    // Reduced-motion / not-yet-mounted: native fallback.
    if (typeof window === "undefined") return;
    if (typeof target === "number") {
      window.scrollTo({ top: target + (options?.offset ?? 0) });
    } else {
      const el =
        typeof target === "string" ? document.querySelector(target) : target;
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Page-scroll progress → store. Spans the whole scrollable distance and
    // works with both Lenis and native scroll.
    const progressTrigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => setScrollProgress(self.progress),
    });

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({ autoRaf: false });
      lenisRef.current = lenis;

      // Keep ScrollTrigger in sync with Lenis's scroll.
      lenis.on("scroll", ScrollTrigger.update);

      // Drive Lenis from GSAP's ticker (seconds → ms) instead of its own rAF.
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      return () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        lenisRef.current = null;
      };
    });

    // Recompute cached scroll heights once web fonts settle. Geist loads with
    // display:swap, whose async swap shifts layout after the first measure and
    // would otherwise leave ScrollTrigger (page progress + section offsets)
    // stale — compressing scrollProgress and mistriggering sections. Both
    // motion modes need this, so it lives outside the matchMedia branch.
    let cancelled = false;
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
    } else {
      ScrollTrigger.refresh();
    }

    return () => {
      cancelled = true;
      mm.revert();
      progressTrigger.kill();
    };
  }, [setScrollProgress]);

  return (
    <LenisScrollContext.Provider value={scrollTo}>
      {children}
    </LenisScrollContext.Provider>
  );
}
