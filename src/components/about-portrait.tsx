"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { bio } from "@/content/bio";
import portrait from "../../public/images/portrait.jpg";

/**
 * Animated portrait for the About section.
 *
 * - Scroll-in entrance (fade + rise + slight scale).
 * - A soft accent glow that gently breathes behind it.
 * - A slow float, plus a hover lift.
 *
 * The two infinite loops (glow + float) only run while the portrait is in the
 * viewport — when scrolled away they settle to static values so motion stops
 * its rAF loop entirely (no idle main-thread work). Transform/opacity only, so
 * the global MotionConfig(reducedMotion="user") stills everything for
 * prefers-reduced-motion users.
 */
export function AboutPortrait() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "10% 0px 10% 0px" });

  return (
    <motion.div
      ref={ref}
      className="relative mx-auto w-full max-w-xs"
      initial={{ opacity: 0, scale: 0.92, y: 24 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        aria-hidden="true"
        className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-accent/30 blur-2xl"
        animate={
          inView
            ? { opacity: [0.3, 0.55, 0.3], scale: [0.97, 1.04, 0.97] }
            : { opacity: 0.4, scale: 1 }
        }
        transition={
          inView
            ? { duration: 7, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 }
        }
      />

      <motion.div
        className="relative overflow-hidden rounded-2xl border border-border bg-surface"
        animate={inView ? { y: [0, -10, 0] } : { y: 0 }}
        transition={
          inView
            ? { duration: 8, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 }
        }
        whileHover={{ scale: 1.03 }}
      >
        <Image
          src={portrait}
          alt={`Portrait of ${bio.name}`}
          placeholder="blur"
          sizes="(max-width: 768px) 80vw, 320px"
          className="h-auto w-full"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/25 via-transparent to-transparent"
        />
      </motion.div>
    </motion.div>
  );
}
