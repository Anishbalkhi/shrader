"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { sound } from "@/lib/sound";
import { CalModal } from "@/components/modals";
import { Navigation } from "@/components/ui/Navigation";

// Dynamic 3D WebGL Canvas with Retro Phones
const ContactScene = dynamic(
  () => import("@/components/canvas/ContactScene").then((m) => m.ContactScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    ),
  }
);

interface ContactSectionProps {
  onOpenCal?: () => void;
}

export function ContactSection({ onOpenCal }: ContactSectionProps) {
  const [internalCalOpen, setInternalCalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress of the contact hero section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [scrollVal, setScrollVal] = useState(0);

  // Sync scroll progress to state for Three.js scene
  React.useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      setScrollVal(v);
    });
  }, [scrollYProgress]);

  const handleOpenCal = () => {
    sound.playClick();
    if (onOpenCal) {
      onOpenCal();
    } else {
      setInternalCalOpen(true);
    }
  };

  // Staggered fade/slide-up reveal variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen text-[#f5f0e6] select-none overflow-x-hidden"
      style={{
        background: "radial-gradient(circle at center, #14151c 0%, #000000 80%)",
      }}
    >
      {/* ── 1. FIXED TRANSPARENT HEADER (no solid fill, no backdrop blur, thin 1px white/14% border) ── */}
      <Navigation
        activeSection="contact"
        onOpenCal={handleOpenCal}
      />

      {/* Screen corner vignette / subtle CRT atmosphere */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 115% 115% at 50% 50%, transparent 55%, rgba(0,0,0,0.8) 100%)",
          zIndex: 2,
        }}
      />

      {/* ── 2. HERO VIEWPORT WITH 3D RETRO PHONE CLUSTER ── */}
      <section
        id="contact-hero"
        className="relative w-full h-screen flex flex-col items-center justify-between overflow-hidden"
      >
        {/* Top headline area in hero */}
        <div className="w-full flex flex-col items-center pt-[14vh] z-20 pointer-events-none">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="font-stix text-center leading-none px-4 select-none"
            style={{
              fontSize: "clamp(64px, 11vw, 160px)",
              fontWeight: 400,
              color: "#f5f0e6",
              letterSpacing: "-0.015em",
              textShadow:
                "0 0 20px rgba(255,235,190,0.55), 0 0 40px rgba(255,235,190,0.25), 0 4px 18px rgba(0,0,0,0.9)",
            }}
          >
            “Hello”
          </motion.h1>
        </div>

        {/* 3D WebGL Canvas (scales down 1 -> 0.6 and translates upward as user scrolls) */}
        <div className="absolute inset-0 z-10 pointer-events-auto">
          <ContactScene scrollProgress={scrollVal} />
        </div>

        {/* Scroll indicator prompt */}
        <div
          className="pb-8 z-20 flex flex-col items-center pointer-events-none opacity-50 hover:opacity-90 transition-opacity"
          style={{ letterSpacing: "0.08em", fontSize: 11, textTransform: "uppercase" }}
        >
          <span style={{ color: "#e6e4dc" }}>Scroll to Contact</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#e6e4dc"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-1 animate-bounce"
          >
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </section>

      {/* ── 3. MAIN CONTACT BODY ("Good buy." + 3-Column Info + Ticket Card + Footer) ── */}
      <section
        id="contact"
        className="relative w-full py-24 sm:py-32 px-6 sm:px-12 flex flex-col items-center z-20"
      >
        {/* Large serif headline with layered text-shadow glow */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-stix text-center leading-none select-none"
          style={{
            fontSize: "clamp(56px, 10vw, 150px)",
            fontWeight: 400,
            color: "#f5f0e6",
            letterSpacing: "-0.015em",
            textShadow:
              "0 0 20px rgba(255, 235, 190, 0.55), 0 0 40px rgba(255, 235, 190, 0.25), 0 4px 16px rgba(0,0,0,0.9)",
          }}
        >
          Good buy.
        </motion.h2>

        {/* Subheading paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-stix text-center mt-8 sm:mt-10 max-w-xl text-lg sm:text-2xl leading-relaxed text-[#e6e4dc] font-light"
          style={{ textShadow: "0 0 20px rgba(0,0,0,0.8)" }}
        >
          Contact us about your digital project idea or general enquires. Let’s
          interface, call us today!
        </motion.p>

        {/* ── 4. 3-COLUMN CONTACT GRID (staggered scroll entrance) ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mt-16 sm:mt-24 text-center font-stix"
        >
          {/* Column 1: General Enquiries */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-semibold text-[#f5f0e6] mb-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
              General Enquiries
            </h3>
            <a
              href="mailto:hello@shader.se"
              onClick={() => sound.playClick()}
              onMouseEnter={() => sound.playHover()}
              className="text-lg sm:text-xl text-[#e6e4dc] underline underline-offset-4 decoration-white/30 hover:decoration-white hover:text-white transition-all"
            >
              hello@shader.se
            </a>
            <button
              onClick={handleOpenCal}
              onMouseEnter={() => sound.playHover()}
              className="text-lg sm:text-xl text-[#e6e4dc] underline underline-offset-4 decoration-white/30 hover:decoration-white hover:text-white transition-all cursor-pointer focus:outline-none"
            >
              Book a call
            </button>
          </motion.div>

          {/* Column 2: Visit us */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-1.5">
            <h3 className="text-xl sm:text-2xl font-semibold text-[#f5f0e6] mb-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
              Visit us
            </h3>
            <p className="text-lg sm:text-xl text-[#d4d1c7]">Laxholmstorget 3</p>
            <p className="text-lg sm:text-xl text-[#d4d1c7]">602 21 Norrköping</p>
            <p className="text-lg sm:text-xl text-[#d4d1c7]">Sweden</p>
          </motion.div>

          {/* Column 3: Social */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-semibold text-[#f5f0e6] mb-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
              Social
            </h3>
            <a
              href="https://www.linkedin.com/company/shadersweden/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              onMouseEnter={() => sound.playHover()}
              className="text-lg sm:text-xl text-[#e6e4dc] underline underline-offset-4 decoration-white/30 hover:decoration-white hover:text-white transition-all"
            >
              LinkedIn
            </a>
            <a
              href="https://www.instagram.com/shadersweden/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              onMouseEnter={() => sound.playHover()}
              className="text-lg sm:text-xl text-[#e6e4dc] underline underline-offset-4 decoration-white/30 hover:decoration-white hover:text-white transition-all"
            >
              Instagram
            </a>
            <a
              href="https://x.com/shadersweden"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              onMouseEnter={() => sound.playHover()}
              className="text-lg sm:text-xl text-[#e6e4dc] underline underline-offset-4 decoration-white/30 hover:decoration-white hover:text-white transition-all"
            >
              X (Twitter)
            </a>
          </motion.div>
        </motion.div>

        {/* ── 5. DASHED-BORDER "TICKET" CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl mt-20 sm:mt-28"
        >
          <div
            className="relative w-full rounded-lg p-5 sm:p-7 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 transition-transform hover:scale-[1.01]"
            style={{
              border: "1.5px dashed rgba(255, 255, 255, 0.32)",
              background: "rgba(255, 255, 255, 0.02)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            {/* CEO Photo (left) */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded shrink-0 overflow-hidden border border-white/20 bg-black shadow-inner">
              <img
                src="/textures/simon_calling.webp"
                alt="Simon, CEO of Shader"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>

            {/* CEO CTA Text (right) */}
            <div className="flex flex-col text-center sm:text-left font-stix">
              <h4 className="text-2xl sm:text-3xl font-semibold text-[#f5f0e6] mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                New business
              </h4>
              <p className="text-base sm:text-xl text-[#e6e4dc] leading-snug">
                Reach out today to our CEO for new business enquiries at{" "}
                <a
                  href="mailto:ceo@shader.se"
                  onClick={() => sound.playClick()}
                  onMouseEnter={() => sound.playHover()}
                  className="text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-all font-medium"
                >
                  ceo@shader.se
                </a>
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── 6. FOOTER BAR (3 evenly spaced items with subtle icon glow) ── */}
        <motion.footer
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-6xl mt-24 sm:mt-32 pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-6 text-center select-none font-stix"
        >
          {/* 1. Certification Badge */}
          <div className="w-44 sm:w-56 flex flex-col items-center">
            <img
              src="/textures/footer_certificate.png"
              alt="Worldwide Business Certified Company"
              className="w-full h-auto object-contain opacity-90 hover:opacity-100 transition-opacity drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
              draggable={false}
            />
          </div>

          {/* 2. Centered Logo + Tagline + Copyright */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2.5 mb-1">
              <img
                src="/textures/logo.svg"
                alt="SHADER"
                className="h-5 sm:h-6 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                style={{
                  filter:
                    "drop-shadow(-0.8px 0 0 rgba(255,30,70,0.5)) drop-shadow(0.8px 0 0 rgba(30,220,255,0.5))",
                }}
              />
            </div>
            <p className="text-base sm:text-lg italic text-[#e6e4dc]">
              A High Tech Business Solutions Company
            </p>
            <p className="text-xs sm:text-sm text-[#8a8880] mt-1">
              © Shader Sweden AB. All Rights Reserved.
            </p>
          </div>

          {/* 3. Accessibility Badge */}
          <div className="w-44 sm:w-56 flex flex-col items-center">
            <a
              href="/accessibility-statement"
              onClick={() => sound.playClick()}
              onMouseEnter={() => sound.playHover()}
              className="group block"
              aria-label="Read our accessibility statement"
            >
              <img
                src="/textures/a11y.png"
                alt="Read our accessibility statement"
                className="w-full h-auto object-contain opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                draggable={false}
              />
            </a>
          </div>
        </motion.footer>
      </section>

      {/* Interactive Cal Booking Modal */}
      <CalModal
        isOpen={internalCalOpen}
        onClose={() => setInternalCalOpen(false)}
      />
    </div>
  );
}
