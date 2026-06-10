"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { bio } from "@/content/bio";
import portrait from "../../public/images/portrait.jpg";

/**
 * Animated portrait for the About section.
 *
 * - Scroll-in entrance (fade + rise + slight scale).
 * - A soft accent glow that gently breathes behind it.
 * - A slow float, plus a hover lift.
 *
 * All of this is transform/scale-based, so the global MotionConfig
 * (reducedMotion="user") makes it effectively still under prefers-reduced-motion.
 */
export function AboutPortrait() {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-xs"
      initial={{ opacity: 0, scale: 0.92, y: 24 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        aria-hidden="true"
        className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-accent/30 blur-2xl"
        animate={{ opacity: [0.3, 0.55, 0.3], scale: [0.97, 1.04, 0.97] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative overflow-hidden rounded-2xl border border-border bg-surface"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
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
