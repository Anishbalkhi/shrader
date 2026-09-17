"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/ui";
import { SelectedWork } from "@/components/sections";
import { ProjectModal, CalModal } from "@/components/modals";
import { Project } from "@/lib/data/projects";
import { sound } from "@/lib/sound";

export default function WorkPage() {
  const router = useRouter();
  const [isCalOpen, setIsCalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [exitDirection, setExitDirection] = useState<"home" | "about" | null>(null);
  const [isEntering, setIsEntering] = useState(true);

  // Prefetch adjacent routes for zero-latency instant transitions
  React.useEffect(() => {
    setIsExiting(false);
    setExitDirection(null);
    setIsEntering(true);
    router.prefetch("/");
    router.prefetch("/about-us");

    try {
      import("@/components/canvas/OfficeScene");
    } catch {
      // safe fallback
    }

    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [router]);

  const handleGoHome = () => {
    if (isExiting || selectedProject !== null || isCalOpen) return;
    setIsExiting(true);
    setExitDirection("home");
    sound.playClick();
    setTimeout(() => {
      router.push("/?reverse=1");
    }, 220);
  };

  const handleGoAboutUs = () => {
    if (isExiting || selectedProject !== null || isCalOpen) return;
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

      {/* Smooth camera entrance dissolve from terminal CRT zoom */}
      {isEntering && (
        <div
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            animation: "workEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards",
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
        @keyframes workExit {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </main>
  );
}
