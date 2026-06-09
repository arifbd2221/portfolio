"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "@/lib/store";
import { projects } from "@/content/projects";

/**
 * Camera focus targets per project id — arranged on a ring around the cloud.
 * The AI's focusProject(id) tool (Phase 7) sets sceneCommand; the camera flies
 * to the matching node here. Stable project ids are the contract.
 */
const focusTargets = new Map<string, THREE.Vector3>(
  projects.map((p, i) => {
    const angle = (i / Math.max(projects.length, 1)) * Math.PI * 2;
    return [p.id, new THREE.Vector3(Math.cos(angle) * 3, Math.sin(angle) * 1.1, 4)];
  }),
);

const SCROLL_START = new THREE.Vector3(0, 0, 7);
const SCROLL_END = new THREE.Vector3(0, 1.4, 4.2);

/**
 * Drives the camera from the store inside useFrame (reading imperatively, never
 * re-rendering). Base position follows scrollProgress; a focusProject command
 * overrides it toward a node and clears itself once the camera arrives.
 *
 * Works with frameloop="demand": a store subscription invalidates on every
 * change (so scrolling renders), and the rig keeps invalidating until the lerp
 * has settled — then rendering naturally pauses.
 */
export function CameraRig() {
  const invalidate = useThree((s) => s.invalidate);
  const target = useRef(new THREE.Vector3());

  useEffect(() => {
    const unsubscribe = useAppStore.subscribe(() => invalidate());
    return unsubscribe;
  }, [invalidate]);

  useFrame((state, delta) => {
    const { scrollProgress, sceneCommand } = useAppStore.getState();
    const next = target.current;

    // smoothstep-eased base path from scroll progress
    const eased =
      scrollProgress * scrollProgress * (3 - 2 * scrollProgress);
    next.copy(SCROLL_START).lerp(SCROLL_END, eased);

    let focusing = false;
    if (sceneCommand?.type === "focusProject") {
      const focusTarget = focusTargets.get(sceneCommand.id);
      if (focusTarget) {
        next.copy(focusTarget);
        focusing = true;
      }
    }

    // frame-rate-independent damping toward the target
    const alpha = 1 - Math.exp(-3 * delta);
    state.camera.position.lerp(next, alpha);
    state.camera.lookAt(0, 0, 0);

    const distance = state.camera.position.distanceTo(next);
    if (focusing && distance < 0.02) {
      useAppStore.getState().clearSceneCommand();
    }
    // keep draining the lerp until it settles, then let demand-mode idle
    if (distance > 0.001) invalidate();
  });

  return null;
}
