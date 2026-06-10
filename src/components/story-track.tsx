"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import type { StoryBeat } from "@/content/story";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scrollytelling engine.
 *
 * Default DOM (also the SSR / no-JS / reduced-motion / mobile output) is a clean
 * stacked sequence of full-height beats — fully readable with no animation.
 *
 * On desktop with motion allowed, GSAP collapses the stacked beats into one
 * pinned viewport and scrubs a crossfade + parallax timeline as you scroll. The
 * matchMedia auto-reverts (restoring the stacked layout) when the query stops
 * matching or on unmount, so the fallback is always intact.
 *
 * Data-driven: the engine reads `beats` and never needs editing to change the
 * narrative.
 */
export function StoryTrack({ beats }: { beats: StoryBeat[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();
    mm.add(
      "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
      () => {
        const ctx = gsap.context(() => {
          const beatEls = gsap.utils.toArray<HTMLElement>("[data-beat]", root);
          if (beatEls.length < 2) return;

          // Collapse the stacked beats into a single pinned viewport.
          gsap.set(root, { height: "100vh" });
          gsap.set(beatEls, {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            autoAlpha: 0,
          });
          gsap.set(beatEls[0], { autoAlpha: 1 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: `+=${beatEls.length * 100}%`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              // This pin adds pin-spacing to the document. refreshPriority > 0
              // makes it refresh BEFORE the document-height-dependent triggers
              // (the global end:"max" progress trigger and the per-section
              // activeSection trigger), so they measure with the spacing in
              // place — no compressed scrollProgress or mistriggered sections.
              refreshPriority: 1,
            },
          });

          for (let i = 0; i < beatEls.length - 1; i++) {
            const nextImage = beatEls[i + 1].querySelector("[data-beat-image]");
            tl.to(beatEls[i], { autoAlpha: 1, duration: 1 }); // dwell
            tl.to(beatEls[i], {
              autoAlpha: 0,
              duration: 0.8,
              ease: "power1.inOut",
            });
            tl.to(
              beatEls[i + 1],
              { autoAlpha: 1, duration: 0.8, ease: "power1.inOut" },
              "<",
            );
            if (nextImage) {
              tl.from(
                nextImage,
                { yPercent: 10, scale: 1.08, duration: 0.8, ease: "power1.out" },
                "<",
              );
            }
          }
          tl.to(beatEls[beatEls.length - 1], { autoAlpha: 1, duration: 1 }); // final dwell
        }, root);

        return () => ctx.revert();
      },
    );

    return () => mm.revert();
  }, [beats.length]);

  return (
    <div ref={rootRef} className="relative">
      {beats.map((beat, i) => (
        <article
          key={beat.id}
          data-beat
          className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
        >
          {/* DEMO photo — replace beat.image with your own. The scrim below
              keeps the text legible over any image. */}
          <div data-beat-image aria-hidden="true" className="absolute inset-0">
            <Image
              src={beat.image}
              alt=""
              fill
              sizes="100vw"
              priority={i === 0}
              className="object-cover"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/50"
          />
          <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-white/70">
              {beat.kicker}
            </p>
            <h3 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {beat.heading}
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-white/85">
              {beat.body}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
