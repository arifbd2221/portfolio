"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAppStore } from "@/lib/store";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

gsap.registerPlugin(ScrollTrigger);

interface SectionProps {
  /** Stable section id — written to the store as activeSection when in view. */
  id: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/**
 * A page section that reports itself as the active section to the store when it
 * occupies the viewport center. Works under both Lenis and native scroll
 * (ScrollTrigger listens to whichever is driving). The store value feeds nav
 * highlighting and the 3D scene later on.
 */
export function Section({ id, children, className, ...aria }: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const setActiveSection = useAppStore((s) => s.setActiveSection);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (self.isActive) setActiveSection(id);
      },
    });

    return () => trigger.kill();
  }, [id, setActiveSection]);

  return (
    <section ref={ref} id={id} className={className} {...aria}>
      {children}
    </section>
  );
}
