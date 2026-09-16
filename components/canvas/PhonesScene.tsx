"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { useSpringMouse } from "../providers/MouseContext";

function RetroPhoneModel() {
  const { scene, materials } = useGLTF("/models/phones.glb") as any;
  const groupRef = useRef<THREE.Group>(null);
  const { getMouse } = useSpringMouse();

  useEffect(() => {
    // Configure materials matching Shader's original Lc function
    if (materials) {
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
    }
  }, [materials]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const mouse = getMouse();
      // Mouse parallax matching shader.se
      const targetRotY = Math.PI + mouse.x * 0.12;
      const targetRotX = 0.3 + mouse.y * 0.08;
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 4, delta);
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 4, delta);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0.3, -0.6, -1.2]}
      rotation={[0.3, Math.PI, 0]}
    >
      <primitive
        object={scene}
        scale={1.25}
        rotation={[0.3, 0, 0]}
        position={[0, -3.8, -2.8]}
      />
    </group>
  );
}

export function PhonesScene() {
  return (
    <section
      aria-label="Let's Interface — Retro Telephone"
      className="relative w-full h-[88vh] min-h-[660px] max-h-[940px] bg-[#07080a] text-white overflow-hidden flex flex-col items-center justify-between select-none"
    >
      {/* ── 1. "HELLO" TITLE CARD (Centered Above Phones) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex flex-col items-center pt-14 sm:pt-20 z-20 pointer-events-none"
      >
        <h2
          className="font-stix text-[#f5f2e9] text-center tracking-[-0.015em] leading-none px-4 select-none"
          style={{
            fontSize: "clamp(68px, 12vw, 185px)",
            fontWeight: 400,
            textShadow:
              "0 0 35px rgba(255, 235, 200, 0.75), 0 0 85px rgba(255, 215, 140, 0.45), 0 4px 18px rgba(0,0,0,0.9)",
            filter:
              "drop-shadow(-1px 0 0 rgba(255, 30, 70, 0.6)) drop-shadow(1px 0 0 rgba(30, 220, 255, 0.6))",
          }}
        >
          &ldquo;Hello&rdquo;
        </h2>
        <p className="font-stix italic text-xl sm:text-2xl lg:text-3xl text-[#c7c2b3] mt-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          Let&apos;s interface, call us today.
        </p>
      </motion.div>

      {/* ── 2. FULL-BLEED 3D RETRO PHONE CANVAS (Matching FOV 65 & Shader.se Camera Rig) ── */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 65, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={2.4} color="#ffffff" />
          <pointLight position={[0, 5, 0]} intensity={320} color="#ffeedd" />
          <directionalLight position={[4, 6, 4]} intensity={1.6} color="#ffffff" />
          <directionalLight position={[-4, 3, -2]} intensity={0.9} color="#9ec7d9" />
          <RetroPhoneModel />
        </Canvas>
      </div>

      {/* Atmospheric center aura glow behind phones */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[500px] h-[500px] bg-[#ffffff]/[0.03] rounded-full blur-3xl pointer-events-none z-10" />
    </section>
  );
}
