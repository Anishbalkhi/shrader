"use client";

import React, { useState } from "react";
import { AboutSection } from "@/components/sections";
import { CalModal } from "@/components/modals";

export default function AboutUsPage() {
  const [isCalOpen, setIsCalOpen] = useState(false);
  const [isEntering, setIsEntering] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-[#EFE9D3] text-[#1f1e1a]">
      <AboutSection onOpenCal={() => setIsCalOpen(true)} showNavigation={true} />
      <CalModal isOpen={isCalOpen} onClose={() => setIsCalOpen(false)} />

      {/* Smooth entrance dissolve from Selected Work */}
      {isEntering && (
        <div
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            animation: "aboutEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            background: "#090a0d",
          }}
        />
      )}

      <style>{`
        @keyframes aboutEnter {
          0% { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
      `}</style>
    </main>
  );
}
