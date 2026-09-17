"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Navigation, BackendBadge, LoadingScreen } from "@/components/ui";
import { Hero } from "@/components/sections";
import { CalModal } from "@/components/modals";
import { sound } from "@/lib/sound";

// Dynamic import for 3D Canvas Scene to prevent SSR window issues
const Scene = dynamic(
  () => import("@/components/canvas/Scene").then((mod) => mod.Scene),
  { ssr: false }
);

export default function HomePage() {
  const router = useRouter();
  const [isCalOpen, setIsCalOpen] = useState(false);
  const [backend, setBackend] = useState<"WebGPU" | "WebGL">("WebGPU");
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isNavigatingToWork, setIsNavigatingToWork] = useState(false);
  const [isReverseEntering, setIsReverseEntering] = useState(false);

  const targetProgress = React.useRef(0);
  const currentProgress = React.useRef(0);
  const hasNavigated = React.useRef(false);
  const coolingDown = React.useRef(false);
  const animFrameId = React.useRef<number | null>(null);

  // Check if returning from reverse scroll or already loaded
  useEffect(() => {
    setIsNavigatingToWork(false);
    hasNavigated.current = false;

    // Prefetch next routes immediately for zero-delay transitions
    router.prefetch("/work");
    router.prefetch("/about-us");

    // Pre-warm dynamic Three.js filmstrip chunk in memory
    try {
      import("@/components/canvas/FilmstripScene");
    } catch {
      // safe fallback
    }

    if (typeof window !== "undefined") {
      if (window.location.hash === "#about-us" || window.location.href.includes("#about-us")) {
        router.replace("/about-us");
        return;
      }

      const isReverse = window.location.search.includes("reverse=1");

      if (isReverse) {
        setIsLoading(false);
        setIsReverseEntering(true);
        // Start fully zoomed in and smoothly zoom out to the wide hero view
        currentProgress.current = 1;
        setScrollProgress(1);
        targetProgress.current = 0;
        coolingDown.current = true;
        hasNavigated.current = false;
        window.history.replaceState(null, "", window.location.pathname);
        setTimeout(() => {
          setIsReverseEntering(false);
        }, 50);
        setTimeout(() => {
          coolingDown.current = false;
        }, 1100);
      }
    }
  }, [router]);

  // Smooth scroll progress loop
  useEffect(() => {
    let active = true;

    const tick = () => {
      if (!active) return;
      const diff = targetProgress.current - currentProgress.current;
      if (Math.abs(diff) > 0.0008) {
        currentProgress.current += diff * 0.12;
        setScrollProgress(currentProgress.current);
      } else if (currentProgress.current !== targetProgress.current) {
        currentProgress.current = targetProgress.current;
        setScrollProgress(currentProgress.current);
      }

      // Seamless camera zoom dive threshold to navigate to Selected Work (/work)
      if (!hasNavigated.current && !coolingDown.current && currentProgress.current >= 0.93) {
        hasNavigated.current = true;
        setIsNavigatingToWork(true);
        sound.playClick();
        setTimeout(() => {
          router.push("/work");
        }, 200);
      }

      animFrameId.current = requestAnimationFrame(tick);
    };

    animFrameId.current = requestAnimationFrame(tick);

    return () => {
      active = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [router]);

  // Wheel and trackpad listener supporting both vertical and horizontal scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isLoading || isCalOpen || isNavigatingToWork) return;
      e.preventDefault();
      // Sensitivity factor - support both deltaY (vertical) and deltaX (horizontal trackpad/tilt wheel)
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      const dominantDelta = absX > absY ? e.deltaX : e.deltaY;
      const delta = dominantDelta * 0.0014;
      targetProgress.current = Math.min(1, Math.max(0, targetProgress.current + delta));
    };

    // Touch support for mobile
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isLoading || isCalOpen) return;
      const currentY = e.touches[0].clientY;
      const deltaY = (touchStartY - currentY) * 0.004;
      touchStartY = currentY;
      targetProgress.current = Math.min(1, Math.max(0, targetProgress.current + deltaY));
    };

    // Keyboard navigation (ArrowDown, PageDown, Space)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading || isCalOpen) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        targetProgress.current = Math.min(1, targetProgress.current + 0.25);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        targetProgress.current = Math.max(0, targetProgress.current - 0.25);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLoading, isCalOpen]);

  const handleScrollDown = () => {
    targetProgress.current = 1;
  };

  return (
    <main className="relative h-screen w-screen bg-black text-foreground overflow-hidden select-none">
      {/* 3D Canvas — fills the viewport */}
      <Scene onBackendChange={setBackend} scrollProgress={scrollProgress} />

      {/* Subtle CRT monitor curvature / vignette framing */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          boxShadow:
            "inset 0 0 80px rgba(0, 0, 0, 0.35), inset 0 0 20px rgba(0, 0, 0, 0.25)",
        }}
      />

      {/* Navigation */}
      <Navigation
        activeSection="hero"
        onOpenCal={() => setIsCalOpen(true)}
      />

      {/* Hero content */}
      <div className="relative z-20 h-full w-full">
        <Hero
          onOpenCal={() => setIsCalOpen(true)}
          scrollProgress={scrollProgress}
          onScrollDown={handleScrollDown}
        />
      </div>

      {/* Engine badge */}
      <BackendBadge backend={backend} />

      {/* Cal.com booking modal */}
      <CalModal isOpen={isCalOpen} onClose={() => setIsCalOpen(false)} />

      {/* CRT loading screen */}
      {isLoading && (
        <LoadingScreen
          onComplete={() => {
            setIsLoading(false);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("shader_has_loaded", "true");
            }
          }}
        />
      )}

      {/* Cinematic CRT monitor zoom dissolve matching Selected Work */}
      {(scrollProgress > 0.78 || isNavigatingToWork) && (
        <div
          className="pointer-events-none fixed inset-0 z-50 transition-opacity"
          style={{
            transitionDuration: isNavigatingToWork ? "220ms" : "80ms",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            opacity: isNavigatingToWork ? 1 : Math.min(0.92, (scrollProgress - 0.78) / 0.18),
            background:
              "radial-gradient(ellipse at center, rgba(255,245,225,0.4) 0%, rgba(13,27,77,0.7) 65%, #01030a 100%)",
          }}
        />
      )}

      {/* Smooth reverse entrance dissolve when returning from /work */}
      {isReverseEntering && (
        <div
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            animation: "reverseEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            background:
              "radial-gradient(ellipse at center, rgba(255,245,225,0.4) 0%, rgba(13,27,77,0.7) 65%, #01030a 100%)",
          }}
        />
      )}

      <style>{`
        @keyframes reverseEnter {
          0% { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
      `}</style>
    </main>
  );
}


