"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { SuperPetTerminal } from "./SuperPetTerminal";
import { checkWebGPUSupport } from "@/lib/webgpu";

interface SceneProps {
  onBackendChange?: (backend: "WebGPU" | "WebGL") => void;
  scrollProgress?: number;
}

export function Scene({ onBackendChange, scrollProgress = 0 }: SceneProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    checkWebGPUSupport().then((isWebGPU) => {
      onBackendChange?.(isWebGPU ? "WebGPU" : "WebGL");
    });
  }, [onBackendChange]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen pointer-events-none z-10 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0.2, 4.5], fov: 50, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
        }}
      >
        <Suspense fallback={null}>
          {/* Deep atmospheric purple-indigo ambient illumination */}
          <ambientLight intensity={0.45} color="#554275" />
          {/* Left key light illuminating smoky backdrop behind hero typography */}
          <directionalLight position={[-4, 7, 3]} intensity={1.1} color="#856ca5" />
          {/* Right studio light illuminating the computer environment */}
          <directionalLight position={[5, 7, 4]} intensity={1.0} color="#b5a0d0" />

          {/* 3D SuperPET Terminal Hero Model */}
          <SuperPetTerminal scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
