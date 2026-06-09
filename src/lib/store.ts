import { create } from "zustand";

/**
 * Commands the AI chat (Phase 7) issues to the 3D scene (Phase 2).
 * The chat dispatches these into the store; the R3F scene reads them in
 * `useFrame`, acts (e.g. flies the camera), and clears the command when done.
 */
export type SceneCommand =
  | { type: "focusProject"; id: string }
  | { type: "navigateTo"; section: string }
  | { type: "showResume" }
  | { type: "reset" };

export interface AppState {
  /** 0 → 1 over the full page. Written by Lenis's scroll event (Phase 1). */
  scrollProgress: number;
  /** id of the section currently in view. Set by per-section ScrollTriggers (Phase 1). */
  activeSection: string;
  /** Pending command for the 3D scene, or null. Consumed + cleared in useFrame (Phase 2/7). */
  sceneCommand: SceneCommand | null;

  setScrollProgress: (progress: number) => void;
  setActiveSection: (section: string) => void;
  setSceneCommand: (command: SceneCommand | null) => void;
  clearSceneCommand: () => void;
}

/**
 * The single shared bus for the whole site. Sections never talk to each other
 * directly — they read from and write to this store.
 */
export const useAppStore = create<AppState>((set) => ({
  scrollProgress: 0,
  activeSection: "hero",
  sceneCommand: null,

  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
  setActiveSection: (activeSection) => set({ activeSection }),
  setSceneCommand: (sceneCommand) => set({ sceneCommand }),
  clearSceneCommand: () => set({ sceneCommand: null }),
}));
