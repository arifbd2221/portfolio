"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "@/lib/store";

interface ParticleFieldProps {
  count?: number;
  color?: string;
}

/**
 * Seeded PRNG (mulberry32) — deterministic so the particle layout is stable
 * across renders/SSR (and pure, unlike Math.random, which React flags in render).
 */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Lightweight particle cloud (THREE.Points) distributed in a spherical shell.
 * Rotation is driven by scrollProgress (read imperatively in useFrame, so it
 * never re-renders React), keeping the scene alive without a continuous rAF —
 * it only animates while frames are being requested in demand mode.
 */
export function ParticleField({ count = 1400, color = "#7c6cff" }: ParticleFieldProps) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const rand = mulberry32(0x9e3779b9);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2.4 + rand() * 2.8;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = radius * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame(() => {
    const points = ref.current;
    if (!points) return;
    const p = useAppStore.getState().scrollProgress;
    points.rotation.y = p * Math.PI * 0.6;
    points.rotation.x = p * Math.PI * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.025}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
}
