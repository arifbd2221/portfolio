"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Initial vertical offset in px (animates to 0). */
  y?: number;
  durationSeconds?: number;
  delaySeconds?: number;
  /** When false, the element re-hides as it scrolls back out of view. */
  once?: boolean;
}

/**
 * Reusable scroll-reveal primitive built on GSAP + ScrollTrigger.
 *
 * Motion is created only inside the `(prefers-reduced-motion: no-preference)`
 * matchMedia branch, so reduced-motion users get the content fully visible with
 * no animation — and GSAP auto-reverts the tween/trigger when the query stops
 * matching or the component unmounts.
 *
 * The from-state is set synchronously (immediateRender) in a layout effect, so
 * below-the-fold content never flashes before it reveals.
 */
export function Reveal({
  children,
  className,
  y = 24,
  durationSeconds = 0.8,
  delaySeconds = 0,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tween = gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: durationSeconds,
          delay: delaySeconds,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: once
              ? "play none none none"
              : "play none none reverse",
          },
        },
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, [y, durationSeconds, delaySeconds, once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
