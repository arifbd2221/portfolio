"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { LenisProvider } from "@/lib/lenis";

/**
 * Client-side provider stack mounted once in the root layout.
 * - next-themes: class-based dark mode, system default (pairs with the
 *   `@custom-variant dark` rule in globals.css).
 * - LenisProvider: smooth-scroll bus (passthrough until Phase 1).
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LenisProvider>{children}</LenisProvider>
    </ThemeProvider>
  );
}
