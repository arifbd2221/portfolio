"use client";

import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, Preload } from "@react-three/drei";
import { CameraRig } from "./CameraRig";
import { ParticleField } from "./ParticleField";

/**
 * The 3D centerpiece. Default-exported so it can be lazy-loaded via
 * next/dynamic(ssr:false) from SceneMount — this module (and all of three.js /
 * r3f / drei) stays out of the initial JS payload.
 *
 * frameloop="demand": renders only when invalidate() is called. CameraRig wires
 * the store's scroll/command bus to invalidate, so the scene is idle at rest.
 * The R3F scene only ever READS the store — it never owns scroll.
 */
export default function Scene() {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 7], fov: 45, near: 0.1, far: 100 }}
    >
      <CameraRig />
      <ParticleField />
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <Preload all />
    </Canvas>
  );
}
