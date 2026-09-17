"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { PROJECTS, Project } from "@/lib/data/projects";
import { sound } from "@/lib/sound";

// Dynamically import Three.js WebGL FilmstripScene (client-only)
const FilmstripScene = dynamic(
  () => import("@/components/canvas/FilmstripScene").then((m) => m.FilmstripScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    ),
  }
);

interface SelectedWorkProps {
  onSelectProject: (project: Project) => void;
  onGoHome?: () => void;
  onGoNext?: () => void;
}

export function SelectedWork({
  onSelectProject,
  onGoHome,
  onGoNext,
}: SelectedWorkProps) {
  // Default to Alamance Foods (index 3) to match reference screenshot
  const [activeIdx, setActiveIdx] = useState(3);
  const total = PROJECTS.length;
  const active = PROJECTS[activeIdx];

  const activeIdxRef = useRef(activeIdx);
  activeIdxRef.current = activeIdx;

  const wheelAccumulator = useRef(0);
  const wheelCooldown = useRef(false);
  const resetTimer = useRef<NodeJS.Timeout | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const go = useCallback(
    (dir: 1 | -1) => {
      sound.playClick();
      const current = activeIdxRef.current;
      // If at last card and scrolling right/moving next, smoothly transition to 3rd page (About Us)
      if (dir === 1 && current === total - 1) {
        if (onGoNext) {
          onGoNext();
          return;
        }
      }
      // If at first card and scrolling left/moving prev, smoothly transition back to 1st page (Home)
      if (dir === -1 && current === 0) {
        if (onGoHome) {
          onGoHome();
          return;
        }
      }
      const nextIdx = (current + dir + total) % total;
      setActiveIdx(nextIdx);
    },
    [total, onGoNext, onGoHome]
  );

  // ── Wheel and trackpad scroll listener to change card with scroll ──────
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelCooldown.current) return;

      // Handle both horizontal trackpad/tilt wheel (deltaX) and vertical scroll (deltaY)
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      const dominantDelta = absX > absY ? e.deltaX : e.deltaY;

      wheelAccumulator.current += dominantDelta;
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => {
        wheelAccumulator.current = 0;
      }, 160);

      const THRESHOLD = 24;
      if (wheelAccumulator.current > THRESHOLD) {
        // Scroll RIGHT or DOWN -> Next card (or About Us if at end)
        wheelAccumulator.current = 0;
        wheelCooldown.current = true;
        go(1);
        setTimeout(() => {
          wheelCooldown.current = false;
        }, 190);
      } else if (wheelAccumulator.current < -THRESHOLD) {
        // Scroll LEFT or UP -> Prev card (or Home if at start)
        wheelAccumulator.current = 0;
        wheelCooldown.current = true;
        go(-1);
        setTimeout(() => {
          wheelCooldown.current = false;
        }, 190);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, [go]);

  // Keyboard navigation (Arrow keys, PageUp, PageDown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        go(1);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [go]);

  return (
    <section
      id="projects"
      aria-label="Selected Work"
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        height: "100vh",
        background:
          "radial-gradient(ellipse 95% 85% at 50% 60%, #0d1b4d 0%, #060e2e 38%, #030718 68%, #01030a 100%)",
      }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null || touchStartY.current === null) return;
        const diffX = e.changedTouches[0].clientX - touchStartX.current;
        const diffY = e.changedTouches[0].clientY - touchStartY.current;

        if (Math.abs(diffX) > Math.abs(diffY)) {
          // Horizontal swipe: left swipe = scroll right / next; right swipe = scroll left / prev
          if (diffX < -35) go(1);
          if (diffX > 35) go(-1);
        } else {
          // Vertical swipe: up swipe = next; down swipe = prev
          if (diffY < -35) go(1);
          if (diffY > 35) go(-1);
        }
        touchStartX.current = null;
        touchStartY.current = null;
      }}
    >
      {/* Outer screen frame border (CRT / monitor aesthetic) */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: 12,
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)",
          zIndex: 60,
        }}
      />

      {/* Screen corner vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 110% 110% at 50% 50%, transparent 50%, rgba(0,0,0,0.8) 100%)",
          zIndex: 2,
        }}
      />

      {/* Subtle top ambient glow */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: "45%",
          background:
            "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(90,150,255,0.14) 0%, transparent 100%)",
          zIndex: 2,
        }}
      />

      {/* ── Project Title & Subtitle (Above the 3D Filmstrip) ── */}
      <div
        className="absolute inset-x-0 flex flex-col items-center pointer-events-none"
        style={{ top: "12vh", zIndex: 30 }}
      >
        <h2
          key={`title-${activeIdx}`}
          className="font-stix text-center leading-none px-6"
          style={{
            fontSize: "clamp(48px, 6.4vw, 94px)",
            fontWeight: 400,
            color: "#ffffff",
            letterSpacing: "-0.015em",
            textShadow:
              "0 0 40px rgba(255, 235, 200, 0.55), 0 0 95px rgba(120, 160, 255, 0.3), 0 4px 14px rgba(0,0,0,0.8)",
            filter:
              "drop-shadow(-0.8px 0 0 rgba(255, 30, 70, 0.5)) drop-shadow(0.8px 0 0 rgba(30, 220, 255, 0.5))",
            animation: "fadeSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          {active.title}
        </h2>

        <div
          key={`sub-${activeIdx}`}
          className="mt-3.5 flex items-center gap-2.5 pointer-events-auto"
          style={{
            fontSize: "clamp(13px, 1.3vw, 16px)",
            color: "rgba(255,255,255,0.65)",
            fontWeight: 300,
            letterSpacing: "0.02em",
            animation: "fadeSlideDown 0.4s 0.06s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          <span>{active.subtitle}</span>
          {active.site_link && (
            <>
              <span style={{ opacity: 0.35 }}>•</span>
              <a
                href={active.site_link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="hover:text-white transition-colors"
                style={{
                  color: "rgba(255,255,255,0.8)",
                  textDecoration: "underline",
                  textDecorationColor: "rgba(255,255,255,0.35)",
                  textUnderlineOffset: 3,
                }}
              >
                View project →
              </a>
            </>
          )}
        </div>
      </div>

      {/* ── Three.js WebGL 3D Filmstrip Reel Canvas ── */}
      <div className="absolute inset-0 z-10">
        <FilmstripScene
          activeIdx={activeIdx}
          onSelectProject={onSelectProject}
          onNavigate={(newIdx) => {
            sound.playClick();
            setActiveIdx(newIdx);
          }}
        />
      </div>

      {/* ── Bottom Controls (Matching shader.se) ── */}
      <div
        className="absolute bottom-0 inset-x-0 flex items-center justify-between pointer-events-none"
        style={{ padding: "0 48px 36px", zIndex: 40 }}
      >
        {/* Previous Button (Clean white arrow in dark square) */}
        <button
          id="carousel-prev"
          type="button"
          onClick={() => go(-1)}
          onMouseEnter={() => sound.playHover()}
          aria-label="Previous project"
          className="pointer-events-auto flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: "rgba(6, 10, 26, 0.82)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
            cursor: "pointer",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Center Scroll Hint / Page Counter (shader.se style) */}
        <button
          type="button"
          onClick={() => go(1)}
          onMouseEnter={() => sound.playHover()}
          className="pointer-events-auto flex flex-col items-center group transition-all hover:scale-105 cursor-pointer focus:outline-none"
          style={{ letterSpacing: "0.08em", fontSize: 11, textTransform: "uppercase" }}
        >
          {activeIdx === total - 1 ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/15 border border-gold-400/40 shadow-[0_0_15px_rgba(255,200,80,0.3)] animate-pulse">
              <span className="text-gold-300 font-medium tracking-wider">
                END OF WORK — SCROLL RIGHT FOR ABOUT US →
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center opacity-70 group-hover:opacity-100 transition-opacity">
              <span style={{ color: "rgba(255,255,255,0.9)" }}>
                {String(activeIdx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} • Scroll for next
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-1 animate-bounce"
              >
                <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
              </svg>
            </div>
          )}
        </button>

        {/* Next Button (Clean white arrow in dark square) */}
        <button
          id="carousel-next"
          type="button"
          onClick={() => go(1)}
          onMouseEnter={() => sound.playHover()}
          aria-label={activeIdx === total - 1 ? "Go to About Us" : "Next project"}
          className="pointer-events-auto flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: activeIdx === total - 1 ? "rgba(25, 20, 10, 0.9)" : "rgba(6, 10, 26, 0.82)",
            border: activeIdx === total - 1 ? "1.5px solid rgba(255, 200, 80, 0.6)" : "1px solid rgba(255, 255, 255, 0.18)",
            boxShadow: activeIdx === total - 1 ? "0 0 20px rgba(255, 200, 80, 0.35)" : "0 8px 30px rgba(0,0,0,0.6)",
            backdropFilter: "blur(16px)",
            cursor: "pointer",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={activeIdx === total - 1 ? "#ffc857" : "white"}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes fadeSlideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
