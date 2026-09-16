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

  const handleGoHome = () => {
    if (isExiting || selectedProject !== null || isCalOpen) return;
    setIsExiting(true);
    sound.playClick();
    setTimeout(() => {
      router.push("/?reverse=1");
    }, 180);
  };

  return (
    <main
      className="relative w-screen bg-black text-foreground select-none overflow-hidden"
      style={{ height: "100svh" }}
    >
      {/* Fixed navigation */}
      <Navigation activeSection="projects" onOpenCal={() => setIsCalOpen(true)} />

      {/* Full-screen 3D filmstrip carousel with scroll card changing */}
      <SelectedWork
        onSelectProject={setSelectedProject}
        onGoHome={handleGoHome}
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

      {/* Smooth CRT flash transition when reverse scrolling to hero */}
      {isExiting && (
        <div
          className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-200"
          style={{
            opacity: 1,
            background:
              "radial-gradient(ellipse at center, rgba(255,240,210,0.5) 0%, rgba(20,10,35,0.85) 70%, #000000 100%)",
          }}
        />
      )}
    </main>
  );
}
