"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import { LenisProvider } from "@/lib/lenis";

/**
 * Client-side provider stack mounted once in the root layout.
 * - next-themes: class-based dark mode, system default (pairs with the
 *   `@custom-variant dark` rule in globals.css).
 * - MotionConfig reducedMotion="user": every `motion` component respects
 *   prefers-reduced-motion automatically (transforms become instant).
 * - LenisProvider: the single smooth-scroll bus.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MotionConfig reducedMotion="user">
        <LenisProvider>{children}</LenisProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
