"use client";

import React, { useRef, useMemo, Suspense, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useSpringMouse } from "../providers/MouseContext";

interface PhonesModelProps {
  scrollProgress?: number;
}

function PhonesModel({ scrollProgress = 0 }: PhonesModelProps) {
  const gltf = useGLTF("/models/phones.glb") as any;
  const scene = gltf.scene;
  const materials = gltf.materials || {};
  const groupRef = useRef<THREE.Group>(null!);
  const { getMouse } = useSpringMouse();

  useMemo(() => {
    if (!materials) return;

    if (materials.green) {
      materials.green.map = null;
      materials.green.emissive = new THREE.Color("#00ff44");
      materials.green.emissiveIntensity = 2.2;
      materials.green.side = THREE.FrontSide;
    }

    if (materials.red) {
      materials.red.map = null;
      materials.red.emissive = new THREE.Color("#ff2222");
      materials.red.emissiveIntensity = 2.0;
      materials.red.side = THREE.FrontSide;
    }

    if (materials.metallic) {
      materials.metallic.roughness = 0.4;
      materials.metallic.metalness = 0.9;
      materials.metallic.color = new THREE.Color("#ffffff");
      materials.metallic.side = THREE.FrontSide;
    }

    if (materials.white) {
      materials.white.roughness = 0.5;
      materials.white.metalness = 0.02;
      materials.white.color = new THREE.Color("#eae5dc");
      materials.white.side = THREE.FrontSide;
    }

    if (materials.black) {
      materials.black.roughness = 0.5;
      materials.black.metalness = 0.35;
      materials.black.color = new THREE.Color("#141416");
      materials.black.side = THREE.FrontSide;
    }

    if (materials["shader-logo"]) {
      materials["shader-logo"].roughness = 0.1;
      materials["shader-logo"].metalness = 0.1;
      materials["shader-logo"].side = THREE.FrontSide;
    }
  }, [materials]);

  // Smooth scroll interpolation & mouse parallax
  useFrame((state, delta) => {
    if (groupRef.current) {
      const mouse = getMouse();
      const targetRotY = Math.PI + mouse.x * 0.12;
      const targetRotX = 0.3 + mouse.y * 0.08;
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 4, delta);
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 4, delta);

      // Scroll-linked smooth transition
      const clampedProgress = Math.min(Math.max(scrollProgress, 0), 1);
      const targetPosY = THREE.MathUtils.lerp(-0.6, 0.4, clampedProgress);
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetPosY, 4, delta);
    }
  });

  return (
    <group ref={groupRef} position={[0.3, -0.6, -1.2]} rotation={[0.3, Math.PI, 0]}>
      <primitive
        object={scene}
        scale={1.25}
        rotation={[0.3, 0, 0]}
        position={[0, -3.8, -2.8]}
      />
    </group>
  );
}

useGLTF.preload("/models/phones.glb");

interface ContactSceneProps {
  scrollProgress?: number;
}

export function ContactScene({ scrollProgress = 0 }: ContactSceneProps) {
  const [internalProgress, setInternalProgress] = useState(scrollProgress);

  useEffect(() => {
    if (typeof scrollProgress === "number" && scrollProgress > 0) {
      setInternalProgress(scrollProgress);
      return;
    }

    const handleScroll = () => {
      const heroEl = document.getElementById("contact-hero");
      const heroHeight = heroEl ? heroEl.offsetHeight : window.innerHeight;
      const progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
      setInternalProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollProgress]);

  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 65, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ display: "block", width: "100%", height: "100%" }}
      >
        <ambientLight intensity={2.4} color="#ffffff" />
        <pointLight position={[0, 5, 0]} intensity={320} color="#ffeedd" />
        <directionalLight position={[4, 6, 4]} intensity={1.6} color="#ffffff" />
        <directionalLight position={[-4, 3, -2]} intensity={0.9} color="#9ec7d9" />

        <Suspense fallback={null}>
          <PhonesModel scrollProgress={internalProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
