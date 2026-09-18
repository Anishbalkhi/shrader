"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/ui";
import { SelectedWork } from "@/components/sections";
import { ProjectModal, CalModal } from "@/components/modals";
import { Project } from "@/lib/data/projects";
import { sound } from "@/lib/sound";
import { consumeNavTransition, setNavTransition } from "@/lib/pageTransition";

export default function WorkPage() {
  const router = useRouter();
  const [isCalOpen, setIsCalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [exitDirection, setExitDirection] = useState<"home" | "about" | null>(null);
  const [isEntering, setIsEntering] = useState(true);
  const [cameFromAbout, setCameFromAbout] = useState(false);
  const [cameFromHome, setCameFromHome] = useState(false);

  // Prefetch adjacent routes for zero-latency instant transitions
  useEffect(() => {
    setIsExiting(false);
    setExitDirection(null);
    setIsEntering(true);

    // If we arrived here via About Us's reverse-scroll exit, pick up the
    // matching solid-overlay entrance so the two pages crossfade as one
    // continuous scroll gesture instead of a hard cut.
    const incoming = consumeNavTransition();
    const fromAbout = incoming === "about-to-work";
    const fromHome = incoming === "home-to-work";
    setCameFromAbout(fromAbout);
    setCameFromHome(fromHome);

    router.prefetch("/");
    router.prefetch("/about-us");

    try {
      import("@/components/canvas/OfficeScene");
    } catch {
      // safe fallback
    }

    // Home already fades its own CRT-zoom overlay in to full opacity before
    // the route change, so Work only needs a short fade-out of that same
    // overlay to finish the gesture — the direct-load entrance (450ms, with
    // the small scale bounce) would otherwise replay the buildup Home just
    // did and read as a stutter.
    const timer = setTimeout(
      () => {
        setIsEntering(false);
      },
      fromAbout ? 520 : fromHome ? 260 : 450
    );
    return () => clearTimeout(timer);
  }, [router]);

  const handleGoHome = () => {
    if (isExiting || selectedProject !== null || isCalOpen) return;
    setIsExiting(true);
    setExitDirection("home");
    sound.playClick();
    setNavTransition("work-to-home");
    setTimeout(() => {
      router.push("/?reverse=1");
    }, 220);
  };

  const handleGoAboutUs = () => {
    if (isExiting || selectedProject !== null || isCalOpen) return;
    // Flag the crossfade direction so the About Us page knows to continue
    // this exact overlay instead of showing its own default entrance.
    setNavTransition("work-to-about");
    setIsExiting(true);
    setExitDirection("about");
    sound.playClick();
    setTimeout(() => {
      router.push("/about-us");
    }, 260);
  };

  return (
    <main
      className="relative w-screen bg-black text-foreground select-none overflow-hidden"
      style={{ height: "100svh" }}
    >
      {/* Fixed navigation */}
      <Navigation activeSection="work" onOpenCal={() => setIsCalOpen(true)} />

      {/* Full-screen 3D filmstrip carousel with scroll card changing */}
      <SelectedWork
        onSelectProject={setSelectedProject}
        onGoHome={handleGoHome}
        onGoNext={handleGoAboutUs}
      />

      {/* Project detail modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Booking modal */}
      <CalModal isOpen={isCalOpen} onClose={() => setIsCalOpen(false)} />

      {/* Default smooth camera entrance dissolve from terminal CRT zoom —
          used for direct loads only now that Home and About Us both hand
          off a matching continuation overlay instead */}
      {isEntering && !cameFromAbout && !cameFromHome && (
        <div
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            animation: "workEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            background:
              "radial-gradient(ellipse at center, rgba(255,245,225,0.4) 0%, rgba(13,27,77,0.7) 65%, #01030a 100%)",
          }}
        />
      )}

      {/* Solid crossfade entrance when arriving from About Us's reverse-scroll
          exit — continues the exact overlay color it left the screen on, so
          the route change reads as one continuous scroll gesture */}
      {isEntering && cameFromAbout && (
        <div
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            animation: "workEnterFromAbout 0.52s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            background: "#0a0b0e",
          }}
        />
      )}

      {/* Continuation entrance when arriving from Home's zoom-dive — Home
          already faded this exact gradient in to full opacity, so this is
          just a quick, no-bounce fade-out of the same overlay rather than a
          fresh buildup, which is what kept the hand-off from reading as one
          continuous zoom before. */}
      {isEntering && cameFromHome && (
        <div
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            animation: "workEnterFromHome 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            background:
              "radial-gradient(ellipse at center, rgba(255,245,225,0.4) 0%, rgba(13,27,77,0.7) 65%, #01030a 100%)",
          }}
        />
      )}

      {/* Smooth transition when reverse scrolling back to hero */}
      {isExiting && exitDirection === "home" && (
        <div
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            animation: "workExit 0.22s ease-in forwards",
            background:
              "radial-gradient(ellipse at center, rgba(255,240,210,0.5) 0%, rgba(20,10,35,0.85) 70%, #000000 100%)",
          }}
        />
      )}

      {/* Smooth transition when advancing to About Us */}
      {isExiting && exitDirection === "about" && (
        <div
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            animation: "workExit 0.24s ease-in forwards",
            background: "#0a0b0e",
          }}
        />
      )}

      <style>{`
        @keyframes workEnter {
          0% { opacity: 1; transform: scale(1.04); }
          100% { opacity: 0; transform: scale(1); pointer-events: none; }
        }
        @keyframes workEnterFromAbout {
          0% { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
        @keyframes workEnterFromHome {
          0% { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
        @keyframes workExit {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </main>
  );
}
