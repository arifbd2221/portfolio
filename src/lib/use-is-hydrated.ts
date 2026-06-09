import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * false on the server and during the hydration render, true thereafter.
 *
 * Lets a component render deterministic markup for SSR + the hydration pass
 * (matching the server exactly), then switch to client-only behavior on the
 * next commit — without a setState-in-effect or a hydration mismatch.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
