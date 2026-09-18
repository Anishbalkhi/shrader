"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AboutSection } from "@/components/sections";
import { CalModal } from "@/components/modals";
import { consumeNavTransition, setNavTransition } from "@/lib/pageTransition";

// Must match the color Work's "workExit" overlay ends on (see app/work/page.tsx)
const TRANSITION_BG = "#0a0b0e";

export default function AboutUsPage() {
  const router = useRouter();
  const [isCalOpen, setIsCalOpen] = useState(false);
  const [cameFromWork, setCameFromWork] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // If we arrived here via Work's "scroll past the last project" exit,
    // continue that exact overlay so the route change reads as one
    // continuous scroll gesture instead of a hard cut + separate fade-in.
    const incoming = consumeNavTransition();
    const fromWork = incoming === "work-to-about";
    setCameFromWork(fromWork);

    router.prefetch("/work");

    const timer = setTimeout(
      () => {
        setIsEntering(false);
      },
      fromWork ? 520 : 60
    );
    return () => clearTimeout(timer);
  }, [router]);

  const handleExitToWork = () => {
    if (isExiting) return;
    // Flag the crossfade direction so the Work page continues this exact
    // overlay instead of showing its own default entrance.
    setNavTransition("about-to-work");
    setIsExiting(true);
    setTimeout(() => {
      router.push("/work?reverse=1");
    }, 260);
  };

  return (
    <main className="relative min-h-screen w-full bg-[#EFE9D3] text-[#1f1e1a]">
      <AboutSection
        onOpenCal={() => setIsCalOpen(true)}
        showNavigation={true}
        onExitToWork={handleExitToWork}
      />
      <CalModal isOpen={isCalOpen} onClose={() => setIsCalOpen(false)} />

      {/* Crossfade entrance continuing Work's exit overlay — only rendered
          when arriving via the scroll transition, never on a fresh/direct
          load, so a bookmark or refresh doesn't show a pointless dark flash */}
      {isEntering && cameFromWork && (
        <div
          className="pointer-events-none fixed inset-0 z-[60]"
          style={{
            background: TRANSITION_BG,
            animation: "aboutEnter 0.52s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        />
      )}

      {/* Crossfade exit when scrolling up past the fully-peeled page back
          into Work (see PagePeelSection's onOverPeel in AboutSection.tsx) */}
      {isExiting && (
        <div
          className="pointer-events-none fixed inset-0 z-[60]"
          style={{
            background: TRANSITION_BG,
            animation: "aboutExit 0.26s ease-in forwards",
          }}
        />
      )}

      <style>{`
        @keyframes aboutEnter {
          0% { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
        @keyframes aboutExit {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </main>
  );
}
