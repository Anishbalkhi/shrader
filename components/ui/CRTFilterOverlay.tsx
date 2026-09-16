"use client";

import React from "react";

interface CRTFilterOverlayProps {
  className?: string;
  isFixed?: boolean;
}

export function CRTFilterOverlay({
  className = "",
  isFixed = false,
}: CRTFilterOverlayProps) {
  return (
    <div
      className={`pointer-events-none overflow-hidden select-none ${
        isFixed ? "fixed inset-0 z-[9999]" : "absolute inset-0 z-20"
      } ${className}`}
      aria-hidden="true"
    >
      {/* ── 1. Film Grain / CRT Noise using authentic rgba_noise.png texture ── */}
      <div
        className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: "url('/textures/rgba_noise.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* ── 3. Ultra-Fine CRT Scanlines ── */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.45) 0px, rgba(0, 0, 0, 0.45) 1.2px, transparent 1.2px, transparent 3.2px)",
          backgroundSize: "100% 3.2px",
        }}
      />

      {/* ── 4. CRT Outer Bezel Tube Curvature & Deep Radial Vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow:
            "inset 0 0 90px rgba(0, 0, 0, 0.45), inset 0 0 25px rgba(0, 0, 0, 0.35), inset 0 0 6px rgba(0, 0, 0, 0.5)",
          background:
            "radial-gradient(ellipse 110% 105% at 50% 50%, transparent 62%, rgba(0, 0, 0, 0.28) 92%, rgba(0, 0, 0, 0.65) 100%)",
        }}
      />

      {/* ── 5. Subtle CRT Outer Monitor Border (Bezel) ── */}
      <div
        className="absolute pointer-events-none border border-black/25 dark:border-white/10"
        style={{
          inset: "8px",
          borderRadius: "18px",
          boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.25)",
        }}
      />
    </div>
  );
}
