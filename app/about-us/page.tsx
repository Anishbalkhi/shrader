"use client";

import React, { useState } from "react";
import { AboutSection } from "@/components/sections";
import { CalModal } from "@/components/modals";

export default function AboutUsPage() {
  const [isCalOpen, setIsCalOpen] = useState(false);

  return (
    <main className="relative min-h-screen w-full bg-[#EFE9D3] text-[#1f1e1a]">
      <AboutSection onOpenCal={() => setIsCalOpen(true)} showNavigation={true} />
      <CalModal isOpen={isCalOpen} onClose={() => setIsCalOpen(false)} />
    </main>
  );
}
