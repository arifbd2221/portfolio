import { useEffect, useLayoutEffect } from "react";

/**
 * useLayoutEffect on the client, useEffect on the server — avoids React's
 * "useLayoutEffect does nothing on the server" warning during SSR while still
 * running synchronously before paint on the client (so GSAP can set initial
 * states without a flash).
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
