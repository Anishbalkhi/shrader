"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

export function HandshakeScene() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section
      aria-label="Deal Closing Handshake"
      className="relative w-full bg-[#050608] py-16 sm:py-24 overflow-hidden flex flex-col items-center select-none"
    >
      <div className="relative w-full max-w-5xl mx-auto px-4 flex flex-col items-center">
        {/* Cinematic Handshake Video Container */}
        <div className="relative w-full max-w-4xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] bg-black">
          <video
            ref={videoRef}
            src="/videos/handshake.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover filter contrast-[1.08] brightness-[0.95]"
          />

          {/* Golden Glint & Sparkle Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

          {/* Overlay Text: Closing the deal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="absolute bottom-6 left-0 w-full text-center px-6 pointer-events-none z-10"
          >
            <p className="font-stix text-[#f5f2e9] text-xl sm:text-3xl font-medium drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              &ldquo;Firm handshakes, quiet competence, and deals sealed with precision.&rdquo;
            </p>
            <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-[#e5c158] mt-2 block">
              Deal Closed &bull; Executive Interface
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
