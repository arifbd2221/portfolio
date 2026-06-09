import { useCallback, useSyncExternalStore } from "react";

const getServerSnapshot = () => false;

/**
 * SSR-safe media-query hook built on useSyncExternalStore — no setState-in-effect,
 * and React tolerates the server→client snapshot difference for this hook, so
 * there's no hydration warning. Returns false during SSR.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
