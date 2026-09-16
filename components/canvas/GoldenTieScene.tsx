"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { useSpringMouse } from "../providers/MouseContext";

function GoldTieModel() {
  const { scene } = useGLTF("/models/tie.glb") as any;
  const tieRef = useRef<THREE.Group>(null);
  const { getMouse } = useSpringMouse();

  React.useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color("#d4af37"), // Golden Yellow
          emissive: new THREE.Color("#553a06"),
          roughness: 0.18,
          metalness: 0.95,
          clearcoat: 0.8,
          clearcoatRoughness: 0.15,
        });
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (tieRef.current) {
      const mouse = getMouse();
      // Gentle floating animation & rotation
      const time = state.clock.getElapsedTime();
      tieRef.current.position.y = Math.sin(time * 1.8) * 0.35 - 0.2;
      tieRef.current.rotation.y = Math.sin(time * 1.2) * 0.45 + mouse.x * 0.3;
      tieRef.current.rotation.z = Math.cos(time * 1.5) * 0.1;
    }
  });

  return (
    <group ref={tieRef} scale={4.2} position={[0, 0, 0]} rotation={[0.1, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

export function GoldenTieScene({ onOpenCal }: { onOpenCal?: () => void }) {
  return (
    <section
      aria-label="The Golden Tie Ceremony"
      className="relative w-full bg-[#07080d] text-white overflow-hidden py-24 sm:py-36 flex flex-col items-center select-none"
    >
      {/* ── PART 1: STILL NOT CONVINCED ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto px-6 text-center z-20 mb-16 sm:mb-24"
      >
        <span className="font-mono text-xs sm:text-sm tracking-[0.3em] uppercase text-[#e5c158] drop-shadow-md">
          Closing Executive Argument
        </span>
        <h2
          className="font-stix text-white text-center leading-[1.08] tracking-[-0.015em] mt-3"
          style={{ fontSize: "clamp(38px, 6vw, 92px)", fontWeight: 400 }}
        >
          Still Not Convinced We&apos;re Serious About Business?
        </h2>
        <p className="font-stix italic text-lg sm:text-2xl text-[#b8b3a5] mt-4 max-w-xl mx-auto">
          We&apos;ve got one last trick up our sleeve.
        </p>
      </motion.div>

      {/* ── PART 2: THE GOLDEN TIE REWARD CEREMONY ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl mx-auto flex flex-col items-center text-center px-4"
      >
        <h3
          className="font-stix text-[#fce881] drop-shadow-[0_0_25px_rgba(252,232,129,0.4)]"
          style={{ fontSize: "clamp(36px, 5.5vw, 84px)", fontWeight: 500 }}
        >
          Check Out This Golden Tie
        </h3>
        <p className="font-stix text-[#d9d5c8] text-base sm:text-xl lg:text-2xl mt-3 max-w-2xl">
          You made it this far. You deserve a tie-break.
        </p>

        {/* 3D Gold Tie Canvas */}
        <div className="relative w-full h-[520px] sm:h-[640px] max-w-4xl my-4 flex items-center justify-center">
          {/* Left Applauding Audience Cutouts */}
          <div className="hidden sm:flex absolute left-0 bottom-6 items-end gap-3 z-10 pointer-events-none opacity-85">
            <div className="w-24 sm:w-32 lg:w-36 h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter brightness-90">
              <img
                src="/textures/jacob_presenting.webp"
                alt="Applauding Corporate Executive"
                className="w-full h-auto object-contain scale-x-[-1]"
                draggable={false}
              />
            </div>
            <div className="w-20 sm:w-28 lg:w-32 h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter brightness-75 scale-90 -ml-6">
              <img
                src="/textures/filip_footer_5.webp"
                alt="Applauding Corporate Executive"
                className="w-full h-auto object-contain"
                draggable={false}
              />
            </div>
          </div>

          <div className="w-full h-full max-w-xl">
            <Canvas
              camera={{ position: [0, 0, 7.5], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
            >
              {/* Box Studio Lighting */}
              <ambientLight intensity={1.4} color="#fff8e7" />
              <pointLight position={[0, 8, 4]} intensity={280} color="#fffaed" />
              <pointLight position={[-6, 2, 2]} intensity={180} color="#f5c742" />
              <pointLight position={[6, -2, 2]} intensity={160} color="#ffe082" />
              <pointLight position={[0, -5, -3]} intensity={90} color="#ffd54f" />
              <GoldTieModel />
            </Canvas>
          </div>

          {/* Right Applauding Audience Cutouts */}
          <div className="hidden sm:flex absolute right-0 bottom-6 items-end gap-3 z-10 pointer-events-none opacity-85">
            <div className="w-20 sm:w-28 lg:w-32 h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter brightness-75 scale-90 -mr-6">
              <img
                src="/textures/simon_calling.webp"
                alt="Applauding Corporate Executive"
                className="w-full h-auto object-contain scale-x-[-1] rounded"
                draggable={false}
              />
            </div>
            <div className="w-24 sm:w-32 lg:w-36 h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter brightness-90">
              <img
                src="/textures/simon_presenting.webp"
                alt="Applauding Corporate Executive"
                className="w-full h-auto object-contain"
                draggable={false}
              />
            </div>
          </div>

          {/* Golden Ambient Aura Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ffd700]/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Tie-break CTA button */}
        {onOpenCal && (
          <button
            onClick={onOpenCal}
            className="mt-6 px-9 py-4 rounded-full bg-gradient-to-r from-[#e5c158] to-[#fce881] hover:from-[#fce881] hover:to-[#fff09e] text-black font-stix font-semibold text-lg sm:text-xl shadow-[0_0_30px_rgba(229,193,88,0.5)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            Take the Tie-Break: Book a Call
          </button>
        )}
      </motion.div>
    </section>
  );
}
