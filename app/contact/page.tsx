"use client";

import React, { useState } from "react";
import { Navigation } from "@/components/ui";
import { ContactSection } from "@/components/sections";
import { CalModal } from "@/components/modals";

export default function ContactPage() {
  const [isCalOpen, setIsCalOpen] = useState(false);

  return (
    <main className="relative w-full min-h-screen bg-black text-foreground select-none overflow-x-hidden">
      {/* Full Contact Page Content with 3D Phones Scene and Header Navigation */}
      <ContactSection onOpenCal={() => setIsCalOpen(true)} />

      {/* Booking Calendar Modal */}
      <CalModal isOpen={isCalOpen} onClose={() => setIsCalOpen(false)} />
    </main>
  );
}
