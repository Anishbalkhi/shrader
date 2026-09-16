"use client";

import React, { useState } from "react";
import { Navigation } from "@/components/ui";
import { CalModal } from "@/components/modals";
import { sound } from "@/lib/sound";

export default function AccessibilityStatementPage() {
  const [isCalOpen, setIsCalOpen] = useState(false);

  return (
    <main className="relative min-h-screen w-full bg-black text-[#f5f5f0] select-none overflow-x-hidden">
      {/* Outer CRT Monitor Border */}
      <div
        className="fixed pointer-events-none"
        style={{
          inset: 12,
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.6)",
          zIndex: 60,
        }}
      />

      {/* Navigation Header */}
      <Navigation onOpenCal={() => setIsCalOpen(true)} />

      {/* Content Container */}
      <div className="relative z-20 max-w-3xl mx-auto px-6 sm:px-12 pt-36 pb-28 font-stix">
        <h1
          className="text-4xl sm:text-6xl font-normal text-[#fcfbf7] mb-8"
          style={{
            textShadow:
              "0 0 40px rgba(255, 235, 190, 0.45), 0 0 80px rgba(120, 160, 255, 0.25)",
          }}
        >
          Accessibility Statement
        </h1>

        <div className="space-y-6 text-lg sm:text-xl text-[#d5d2c7] leading-relaxed font-light">
          <p>
            Shader is committed to ensuring digital accessibility for people of all
            abilities. We are continually improving the user experience for everyone
            and applying the relevant accessibility standards across our 3D, WebGPU,
            and WebGL digital interfaces.
          </p>

          <h2 className="text-2xl sm:text-3xl font-semibold text-[#fcfbf7] pt-4">
            Conformance Status
          </h2>
          <p>
            The Web Content Accessibility Guidelines (WCAG) defines requirements for
            designers and developers to improve accessibility for people with
            disabilities. We strive to conform to WCAG 2.1 level AA standards.
          </p>

          <h2 className="text-2xl sm:text-3xl font-semibold text-[#fcfbf7] pt-4">
            Feedback & Inquiries
          </h2>
          <p>
            We welcome your feedback on the accessibility of Shader. Please let us
            know if you encounter accessibility barriers:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[#e2dfd5]">
            <li>
              E-mail:{" "}
              <a
                href="mailto:hello@shader.se"
                onClick={() => sound.playClick()}
                className="underline hover:text-white"
              >
                hello@shader.se
              </a>
            </li>
            <li>
              Address: Laxholmstorget 3, 602 21 Norrköping, Sweden
            </li>
          </ul>

          <div className="pt-8">
            <a
              href="/contact"
              onClick={() => sound.playClick()}
              className="inline-block border border-white/30 rounded px-6 py-2.5 text-base sm:text-lg text-white hover:bg-white/10 transition-colors"
            >
              ← Return to Contact
            </a>
          </div>
        </div>
      </div>

      <CalModal isOpen={isCalOpen} onClose={() => setIsCalOpen(false)} />
    </main>
  );
}
