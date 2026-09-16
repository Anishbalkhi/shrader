"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { sound } from "@/lib/sound";
import { Navigation } from "@/components/ui/Navigation";
import { CRTFilterOverlay } from "@/components/ui";
import { CalModal } from "@/components/modals";

// Dynamic 3D Scenes for SSR safety
const OfficeScene = dynamic(
  () => import("@/components/canvas/OfficeScene").then((m) => m.OfficeScene),
  { ssr: false }
);
const GoldenTieScene = dynamic(
  () => import("@/components/canvas/GoldenTieScene").then((m) => m.GoldenTieScene),
  { ssr: false }
);
const HandshakeScene = dynamic(
  () => import("@/components/canvas/HandshakeScene").then((m) => m.HandshakeScene),
  { ssr: false }
);
const PhonesScene = dynamic(
  () => import("@/components/canvas/PhonesScene").then((m) => m.PhonesScene),
  { ssr: false }
);

interface AboutSectionProps {
  onOpenCal?: () => void;
  showNavigation?: boolean;
}

export function AboutSection({
  onOpenCal,
  showNavigation = true,
}: AboutSectionProps) {
  const [internalCalOpen, setInternalCalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isShredding, setIsShredding] = useState(false);
  const [isShredded, setIsShredded] = useState(false);

  const handleOpenCal = () => {
    sound.playClick();
    if (onOpenCal) {
      onOpenCal();
    } else {
      setInternalCalOpen(true);
    }
  };

  const handleTriggerShred = () => {
    sound.playShred();
    setIsShredding(true);
    setTimeout(() => {
      setIsShredded(true);
      setIsShredding(false);
      // Smoothly reveal and scroll to the Golden Tie reward payoff
      setTimeout(() => {
        const el = document.getElementById("shred-payoff");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          handleOpenCal();
        }
      }, 500);
    }, 1800);
  };

  const handleRestore = () => {
    sound.playClick();
    setIsShredded(false);
    setIsShredding(false);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.08 },
    },
  };

  // 7 authentic retro Commodore/Apple horizontal stripes
  const rainbowColors = [
    "#66C5F1", // Sky Blue
    "#D772EC", // Purple / Magenta
    "#F44F39", // Red / Coral
    "#FA9D2E", // Orange
    "#FFCE43", // Yellow
    "#1DCDA1", // Mint / Green
    "#398AC7", // Royal Blue
  ];

  // Pre-calculated ribbon strip offsets for physical shredding animation
  const stripCount = 28;

  return (
    <div
      id="about-us"
      className="relative w-full min-h-screen text-[#1f1e1a] select-none overflow-x-hidden"
      style={{
        backgroundColor: "#EFE9D3", // Warm vintage newsprint paper
      }}
    >
      {/* ── 1. FIXED NAVIGATION BAR (Adaptive Light Theme) ── */}
      {showNavigation && (
        <Navigation activeSection="about-us" onOpenCal={handleOpenCal} />
      )}

      {/* Subtle CRT monitor curvature / vignette framing */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          boxShadow:
            "inset 0 0 80px rgba(0, 0, 0, 0.26), inset 0 0 20px rgba(0, 0, 0, 0.18)",
        }}
      />

      {/* ── FULL PHYSICAL PAPER SHREDDING ANIMATION OVERLAY ── */}
      <AnimatePresence>
        {isShredding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end bg-black/40 backdrop-blur-[2px]"
          >
            {/* Shredder Header Warning Banner */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-700 text-white font-mono text-xs sm:text-sm tracking-widest uppercase px-6 py-2 rounded shadow-2xl animate-pulse">
              ⚠️ EXECUTING MECHANICAL DOCUMENT SHREDDER...
            </div>

            {/* Shredded vertical paper ribbons falling into the teeth */}
            <div className="w-full h-full flex overflow-hidden">
              {Array.from({ length: stripCount }).map((_, i) => {
                const randomDelay = (i % 5) * 0.08 + Math.random() * 0.15;
                const randomRotate = ((i % 4) - 1.5) * 6;
                return (
                  <motion.div
                    key={i}
                    initial={{ y: "-100%", rotate: 0 }}
                    animate={{
                      y: ["0%", "120%"],
                      rotate: [0, randomRotate],
                    }}
                    transition={{
                      duration: 1.4,
                      delay: randomDelay,
                      ease: [0.3, 0, 0.8, 1],
                    }}
                    className="h-full flex-1 border-r border-black/10 shadow-sm"
                    style={{
                      backgroundColor: i % 2 === 0 ? "#EFE9D3" : "#E8E2CB",
                    }}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. 3D OFFICE CUBICLE LANDSCAPE TITLE CARD ── */}
      <section aria-label="Corporate Cubicle Landscape Title Card" className="relative w-full">
        <OfficeScene />
      </section>

      {/* ── 2. TEAM BANNER (Cheesy Staged 1980s Corporate Stock Photo) ── */}
      <section
        aria-label="Shader Founders and Team"
        className="relative w-full bg-[#5d9faa] overflow-hidden"
      >
        <div className="relative w-full max-w-[1920px] mx-auto overflow-hidden">
          <picture>
            <source
              media="(max-width: 640px)"
              srcSet="/textures/group_1x1.webp"
            />
            <img
              src="/textures/group_3x2.webp"
              alt="Shader Founders in dated corporate suits behind Commodore computers with plant"
              className="w-full h-auto max-h-[88vh] object-cover object-bottom"
              draggable={false}
            />
          </picture>

          {/* CRT Monitor Filter Overlay scoped specifically to this section */}
          <CRTFilterOverlay />

          {/* Floating SHADER SWEDEN Corporate Badge */}
          <div className="absolute bottom-5 right-5 sm:bottom-8 sm:right-12 z-30 flex items-center gap-3 bg-black/55 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded border border-white/20 shadow-xl">
            <img
              src="/textures/logo.svg"
              alt="SHADER"
              className="h-4 sm:h-5 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
            />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#e8e4d8] border-l border-white/20 pl-2.5">
              Sweden
            </span>
          </div>
        </div>
      </section>

      {/* ── 3. NARRATIVE ARC: PART 1 & 2 (Sincere Pitch + Capabilities + The Hinge Line) ── */}
      <section
        aria-label="About Us"
        className="relative w-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-16 pt-16 sm:pt-24 pb-20 sm:pb-28 flex flex-col items-center"
      >
        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="font-stix text-center text-[#1f1e1a] leading-[1.06] tracking-[-0.015em] max-w-[1340px] mx-auto select-none"
          style={{
            fontSize: "clamp(42px, 6.4vw, 108px)",
            fontWeight: 400,
          }}
        >
          Making Digital Storytelling More Playful, Powerful, and Alive
        </motion.h1>

        {/* 3-Column Story Structure */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="relative w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-14 mt-14 sm:mt-20 font-stix"
        >
          {/* Column 1: Opening — Sincere & Concrete ("Who we are") */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col gap-6 text-[#2b2826] text-base sm:text-lg lg:text-[19px] leading-relaxed"
          >
            <p>
              Shader is a creative development studio specialized in building
              interactive 3D and AI solutions for the web. Serious about
              business, based in Sweden, and working with brands, agencies and
              designers worldwide.
            </p>
            <p>
              <span className="text-[#151412] font-semibold">
                Plugged into the future.
              </span>{" "}
              While we&apos;re a small team of creative engineers, we have a
              hand-picked network of collaborators: designers, 3D artists,
              copywriters, animators, and creative technologists, ready to plug in
              with an array of capabilities.
            </p>
          </motion.div>

          {/* Column 2: Middle — The Work, Stated Plainly (Capabilities & Crafts) */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col gap-6 text-[#2b2826] text-base sm:text-lg lg:text-[19px] leading-relaxed"
          >
            <p>
              <span className="text-[#151412] font-semibold">
                This modular approach
              </span>{" "}
              means we can scale and adapt to each challenge. Whether it&apos;s a
              WebGL experiment, an interactive product visualization, a mobile
              app, or an AI-driven experience, we help bold brands stand out
              across every screen.
            </p>
            <p>
              We build storytelling platforms that demand attention and reward
              curiosity. We push digital mediums to places you haven&apos;t seen
              before, and have fun doing it. Beyond code, we offer 3D design and
              animation, UI and motion design, concepts and digital strategy,
              full-stack development, and creative consulting.
            </p>
          </motion.div>

          {/* Column 3: The Hinge Line + Jacob at Computer */}
          <motion.div
            variants={fadeInUp}
            className="relative flex flex-col justify-between gap-6 text-[#2b2826] text-base sm:text-lg lg:text-[19px] leading-relaxed"
          >
            <p>
              Whether it&apos;s prototyping an idea, launching an augmented
              reality experience, or bringing high-fidelity visuals to life,
              Shader bridges the gap between creative ambition and technical
              execution. Our process is hands-on, collaborative, and tailored for
              teams that value both craft and innovation. We combine technical
              expertise with a designer&apos;s eye, ensuring that every
              interaction feels natural and every pixel is perfectly placed.{" "}
              {/* The Hinge: The last moment of straight talk before the satire begins */}
              <span className="text-[#151412] font-semibold italic border-b border-[#2b2826]/30 pb-0.5">
                We&apos;re not your regular IT department. We don&apos;t
                troubleshoot printers.
              </span>
            </p>

            {/* Jacob at his green-phosphor computer with printout */}
            <div className="relative mt-2 self-end w-48 sm:w-60 lg:w-72 drop-shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
              <img
                src="/textures/jake_computer.webp"
                alt="Jacob sitting at retro computer holding printout"
                className="w-full h-auto object-contain"
                draggable={false}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── 4. RETRO TECH MOTIF: RAINBOW DIVIDER (Apple/Commodore 7-Stripe Bar) ── */}
      <div
        role="separator"
        aria-label="Retro Rainbow Divider"
        className="w-full flex flex-col gap-[2px] py-1 bg-[#EFE9D3]"
      >
        {rainbowColors.map((color, idx) => (
          <div
            key={idx}
            className="w-full h-[5px] sm:h-[6px]"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* ── 5. SOCIAL PROOF: A SHOWCASE OF VALUED CLIENTS ── */}
      <section
        aria-label="A Showcase of Valued Clients"
        className="relative w-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-16 pt-16 sm:pt-24 pb-24 sm:pb-32 flex flex-col items-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto px-4"
        >
          <h2
            className="font-stix text-center text-[#1f1e1a] leading-tight"
            style={{
              fontSize: "clamp(38px, 5.5vw, 88px)",
              fontWeight: 400,
            }}
          >
            A Showcase of Valued Clients
          </h2>
          <p className="font-stix text-center text-[#4a4742] text-base sm:text-xl lg:text-2xl mt-5 font-normal leading-relaxed">
            We have had the benefit of working with a large pool of great
            clients throughout the years. Our partnerships ranges from some of the
            most recognizable Swedish brands to international innovators.
          </p>
        </motion.div>

        {/* Client Grid Flanked by Jacob & Simon in Retro Swivel Chairs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-6xl mt-12 sm:mt-16 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4"
        >
          {/* Jacob Presenting in Tan Suit (Left) */}
          <div className="hidden lg:flex w-1/4 justify-center items-center drop-shadow-[0_10px_25px_rgba(0,0,0,0.15)]">
            <img
              src="/textures/jacob_presenting.webp"
              alt="Jacob pointing to client logos"
              className="w-full max-w-[280px] h-auto object-contain hover:scale-105 transition-transform duration-300"
              draggable={false}
            />
          </div>

          {/* Client Logo Cloud (Natural dark ink on warm paper) */}
          <div className="w-full lg:w-1/2 flex justify-center items-center px-4 sm:px-8 py-6">
            <img
              src="/textures/customers_logo_cloud.png"
              alt="Client Logos: ICA, Region Östergötland, PEPSI, RISE, spp, SUICIDE ZERO, Scandic, Cloetta, SON, Universeum, Stadium, Garageport Experten"
              className="w-full max-w-[580px] h-auto object-contain filter contrast-[1.08] hover:scale-[1.01] transition-transform duration-300"
              draggable={false}
            />
          </div>

          {/* Simon Presenting in Brown Suit (Right) */}
          <div className="hidden lg:flex w-1/4 justify-center items-center drop-shadow-[0_10px_25px_rgba(0,0,0,0.15)]">
            <img
              src="/textures/simon_presenting.webp"
              alt="Simon pointing to client logos"
              className="w-full max-w-[280px] h-auto object-contain hover:scale-105 transition-transform duration-300"
              draggable={false}
            />
          </div>

          {/* Mobile / Tablet Presenters */}
          <div className="flex lg:hidden items-center justify-center gap-8 w-full mt-4">
            <img
              src="/textures/jacob_presenting.webp"
              alt="Jacob"
              className="w-36 sm:w-44 h-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]"
              draggable={false}
            />
            <img
              src="/textures/simon_presenting.webp"
              alt="Simon"
              className="w-36 sm:w-44 h-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]"
              draggable={false}
            />
          </div>
        </motion.div>
      </section>

      {/* ── 6. VINTAGE TECH TRANSITION: 3D COMMODORE 64 "NET SALES" BANNER ── */}
      <section
        aria-label="Corporate Retro Computer Setup"
        className="relative w-full bg-[#1b1c20] border-y border-black/30 overflow-hidden shadow-2xl"
      >
        <div className="relative w-full max-w-[1920px] mx-auto">
          <img
            src="/textures/computer.webp"
            alt="Commodore computer setup displaying NET SALES BY DIVISION 3D bar chart"
            className="w-full h-auto max-h-[75vh] object-cover object-center"
            draggable={false}
          />
        </div>
      </section>

      {/* ── 7. THE TURN: ESCALATING CORPORATE JARGON + MAIL-IN COUPON CTA ── */}
      <section
        aria-label="For Companies Serious About Technology"
        className="relative w-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-16 pt-16 sm:pt-24 pb-20 sm:pb-28"
      >
        <div className="w-full flex flex-col lg:flex-row items-start justify-between gap-14 lg:gap-20">
          
          {/* Left: Straight-Faced Satire of Corporate Jargon */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-[56%] flex flex-col font-stix"
          >
            <h2
              className="text-[#1f1e1a] leading-tight mb-8"
              style={{
                fontSize: "clamp(36px, 5vw, 84px)",
                fontWeight: 400,
              }}
            >
              For Companies Serious About Technology
            </h2>

            <div className="flex flex-col gap-6 text-[#2b2826] text-base sm:text-lg lg:text-[19px] leading-relaxed">
              <p>
                In today&apos;s fast-paced corporate landscape, you need a partner
                who understands the bottom line. At Shader, we engineer success
                through <span className="font-semibold">strategic alliances</span>{" "}
                and <span className="font-semibold">mutual profitability</span>. Our
                team is ready to <span className="font-semibold">synergize</span> with
                your organization, unlock <span className="font-semibold">new verticals</span>,
                and maximize your <span className="font-semibold">digital ROI</span>.
                We don&apos;t just close deals; we deliver results that compound.
              </p>
              <p>
                We leverage state-of-the-art technology to give your brand a
                decisive competitive advantage. Whether disrupting the market with{" "}
                <span className="font-semibold">paradigm-shifting 3D experiences</span>{" "}
                or streamlining operations with cutting-edge AI, we provide{" "}
                <span className="font-semibold">turnkey solutions that scale</span>.
                We merge high-performance engineering with{" "}
                <span className="font-semibold">executive-level design</span> to
                build assets that appreciate your brand value.
              </p>
              {/* Closing Mock-Urgency: The Trajectory Points Up! */}
              <p>
                Ready to take your enterprise to the next level? Don&apos;t waste
                valuable time. Review our portfolio, crunch the numbers, and
                you&apos;ll see the trajectory points one way:{" "}
                <span className="font-bold underline decoration-black/40">
                  up
                </span>. Pick up the phone, send a fax, or schedule a
                consultation. The future of your business is waiting. Let&apos;s
                execute.
              </p>
            </div>

            {/* A High Tech Solutions Company Badge */}
            <div className="mt-12 pt-8 border-t border-black/15 flex items-center justify-between gap-6">
              <div className="flex flex-col">
                <img
                  src="/textures/logo_dark.svg"
                  alt="SHADER"
                  className="h-6 sm:h-7 w-auto object-contain mb-2 opacity-90"
                />
                <span className="font-stix italic text-sm sm:text-base text-[#4a4742]">
                  A High Tech Business Solutions Company
                </span>
              </div>

              <div className="w-28 sm:w-36 shrink-0 opacity-90 hover:opacity-100 transition-opacity drop-shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
                <img
                  src="/textures/computer_narrow.webp"
                  alt="Retro Commodore Terminal"
                  className="w-full h-auto object-contain"
                  draggable={false}
                />
              </div>
            </div>
          </motion.div>

          {/* Right: The Mail-In Coupon Punchline (`Mo`) */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-[42%] flex justify-center"
          >
            <div className="relative w-full max-w-lg">
              {/* Vintage Scissors Cutting along the dashed line */}
              <div className="absolute -top-7 -left-5 z-30 w-12 h-14 pointer-events-none drop-shadow-md">
                <img
                  src="/textures/scissors.png"
                  alt="Scissors cutting coupon"
                  className="w-full h-full object-contain filter contrast-125"
                  draggable={false}
                />
              </div>

              {/* The Paper Coupon Container */}
              <div
                className="relative w-full rounded p-6 sm:p-9 text-[#111111] shadow-[0_15px_35px_rgba(0,0,0,0.18)]"
                style={{
                  backgroundColor: "#FAF7EF",
                  border: "2.5px dashed #222222",
                }}
              >
                <div className="flex flex-col">
                  <span className="text-[11px] font-mono tracking-wider uppercase text-[#666] mb-1">
                    Official Voucher
                  </span>
                  <h3 className="font-stix text-2xl sm:text-3xl font-bold text-[#111] leading-tight mb-3">
                    Act now! Book a Consultation.
                  </h3>
                  <p className="font-stix text-[#333] text-sm sm:text-base leading-relaxed mb-6">
                    Cut along the dotted line and mail this to the post address
                    below for a free 30 minute video call consultation.
                  </p>

                  {/* Email Form Line */}
                  <div className="flex items-end gap-2 w-full my-3">
                    <span className="font-stix text-sm sm:text-base font-bold text-[#111] shrink-0">
                      Email:
                    </span>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="your.email@company.com"
                      className="w-full bg-transparent border-b-2 border-[#333] text-sm sm:text-base px-2 py-0.5 text-[#111] focus:outline-none focus:border-[#5E33BF] placeholder:text-[#888] font-mono"
                    />
                  </div>

                  {/* Postal Address */}
                  <div className="mt-6 pt-4 border-t border-[#d8d3c5] text-xs sm:text-sm font-stix text-[#444] space-y-0.5">
                    <p className="font-bold text-[#111]">Shader Sweden AB</p>
                    <p>Laxholmstorget 3</p>
                    <p>602 21 Norrköping, Sweden</p>
                    <p className="text-xs text-[#777] pt-2">
                      Or click below to bypass standard postal routes.
                    </p>
                  </div>

                  {/* Genuine CTA Button */}
                  <button
                    onClick={handleOpenCal}
                    onMouseEnter={() => sound.playHover()}
                    className="mt-6 w-full py-3.5 px-6 rounded bg-[#5E33BF] hover:bg-[#6e3ddc] active:scale-[0.99] text-white font-stix font-semibold text-lg sm:text-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-md focus:outline-none cursor-pointer"
                  >
                    <img
                      src="/textures/icons/old_phone.svg"
                      alt=""
                      className="w-5 h-5 object-contain brightness-200"
                    />
                    <span>Book a Call Today</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 8. RAINBOW SEPARATOR STRIPES ── */}
      <div
        role="separator"
        aria-label="Retro Rainbow Divider"
        className="w-full flex flex-col gap-[2px] py-1 bg-[#EFE9D3]"
      >
        {rainbowColors.map((color, idx) => (
          <div
            key={idx}
            className="w-full h-[5px] sm:h-[6px]"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* ── 9. THE PHYSICAL PUNCHLINE: "HAD ENOUGH READING? LET'S SHRED THIS THING." (`Mc`) ── */}
      <section
        aria-label="Paper Shredder Finale"
        className="relative w-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-16 pt-16 sm:pt-24 pb-20 sm:pb-28"
      >
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
          {/* Left: Punchline Headline & Shred Trigger */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <h2
              className="font-stix text-[#1f1e1a] leading-[1.08] tracking-[-0.015em]"
              style={{
                fontSize: "clamp(38px, 5.5vw, 86px)",
                fontWeight: 400,
              }}
            >
              Had Enough Reading? Let&apos;s Shred This Thing.
            </h2>
            <p className="font-stix text-lg sm:text-2xl text-[#4a4742] mt-6 font-normal max-w-xl">
              Ready to cut through the noise? Let&apos;s turn your vision into an
              award-winning interactive reality.
            </p>

            {/* Shred Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                onClick={handleTriggerShred}
                onMouseEnter={() => sound.playHover()}
                className="px-8 py-4 rounded bg-[#5E33BF] hover:bg-[#6f3de0] text-white font-stix text-xl font-medium flex items-center gap-3 transition-all duration-200 shadow-[0_4px_16px_rgba(94,51,191,0.35)] focus:outline-none cursor-pointer active:scale-95"
              >
                <span className="text-xl">✂️</span>
                <span>Shred This Document</span>
              </button>

              <button
                onClick={handleOpenCal}
                onMouseEnter={() => sound.playHover()}
                className="px-8 py-4 rounded border border-black/20 hover:border-black/50 text-[#1f1e1a] font-stix text-xl font-normal transition-all duration-200 bg-white/40 flex items-center gap-2"
              >
                <img
                  src="/textures/icons/old_phone.svg"
                  alt=""
                  className="w-4 h-4 brightness-0 opacity-80"
                />
                <span>Book a Consultation</span>
              </button>

              {isShredded && (
                <button
                  onClick={handleRestore}
                  onMouseEnter={() => sound.playHover()}
                  className="px-6 py-3 rounded text-sm font-mono text-stone-600 underline hover:text-stone-900 transition-colors"
                >
                  ↩ Unshred / Restore Document
                </button>
              )}
            </div>

            {/* Shred status notice */}
            {isShredded && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded bg-[#FAF7EF] border border-black/20 font-mono text-xs text-stone-700 max-w-md flex flex-col gap-1 shadow-sm"
              >
                <div className="flex items-center gap-2 text-green-700 font-bold">
                  <span>✓</span>
                  <span>EVIDENCE SHREDDED INTO 28 SLICES</span>
                </div>
                <p>
                  Standard postal correspondence bypassed. Launching direct
                  executive video consultation terminal...
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Right: Filip Shredding Graphic (`/textures/filip_footer_5.webp`) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-1/2 flex justify-center lg:justify-end"
          >
            <div
              onClick={handleTriggerShred}
              className={`relative w-full max-w-[520px] drop-shadow-[0_15px_30px_rgba(0,0,0,0.18)] transition-all duration-500 cursor-pointer ${
                isShredded
                  ? "scale-105 filter contrast-125"
                  : "hover:scale-[1.02] hover:brightness-105"
              }`}
              title="Click Filip to shred the document!"
            >
              <img
                src="/textures/filip_footer_5.webp"
                alt="Filip Shredding Paper"
                className="w-full h-auto object-contain"
                draggable={false}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 10. SHRED PAYOFF & CONTACT CONTINUOUS FLOW ── */}
      <div id="shred-payoff" className="relative w-full bg-[#07080a] text-white">
        {/* Golden Tie Mock Award Ceremony */}
        <GoldenTieScene onOpenCal={handleOpenCal} />

        {/* Handshake Close-up: Hands closing a deal */}
        <HandshakeScene />

        {/* "Hello" over 3D glowing vintage telephone + "Good buy" */}
        <PhonesScene />

        {/* Semantic Accessible Contact Section */}
        <section
          id="contact"
          aria-label="Contact"
          className="relative w-full max-w-6xl mx-auto px-6 sm:px-12 pt-6 pb-24 flex flex-col items-center select-none font-stix"
        >
          <div className="w-full text-center mb-16">
            <h2
              className="text-[#f5f0e6] leading-none"
              style={{
                fontSize: "clamp(56px, 10vw, 150px)",
                fontWeight: 400,
                color: "#f5f0e6",
                letterSpacing: "-0.015em",
                textShadow:
                  "0 0 20px rgba(255, 235, 190, 0.55), 0 0 40px rgba(255, 235, 190, 0.25), 0 4px 16px rgba(0,0,0,0.9)",
              }}
            >
              Good buy. Good buy.
            </h2>
            <p className="font-stix text-[#d9d5c8] text-lg sm:text-2xl mt-6 font-light max-w-xl mx-auto leading-relaxed">
              Contact us about your digital project idea or general enquires.
              Let&apos;s interface, call us today!
            </p>
          </div>

          {/* 3-Column Fieldsets */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 text-center">
            {/* General Enquiries */}
            <fieldset className="border-0 p-0 flex flex-col items-center gap-2">
              <legend className="text-xl sm:text-2xl font-semibold text-[#f5f0e6] mb-2 drop-shadow">
                General Enquiries
              </legend>
              <a
                href="mailto:hello@shader.se"
                onClick={() => sound.playClick()}
                onMouseEnter={() => sound.playHover()}
                className="text-lg sm:text-xl text-[#e6e4dc] underline underline-offset-4 decoration-white/30 hover:text-white transition-all"
              >
                hello@shader.se
              </a>
              <button
                onClick={handleOpenCal}
                onMouseEnter={() => sound.playHover()}
                className="text-lg sm:text-xl text-[#e6e4dc] underline underline-offset-4 decoration-white/30 hover:text-white transition-all cursor-pointer focus:outline-none"
              >
                Book a call
              </button>
            </fieldset>

            {/* Visit us */}
            <fieldset className="border-0 p-0 flex flex-col items-center gap-1">
              <legend className="text-xl sm:text-2xl font-semibold text-[#f5f0e6] mb-2 drop-shadow">
                Visit us
              </legend>
              <p className="text-lg sm:text-xl text-[#d4d1c7]">Laxholmstorget 3</p>
              <p className="text-lg sm:text-xl text-[#d4d1c7]">602 21 Norrköping</p>
              <p className="text-lg sm:text-xl text-[#d4d1c7]">Sweden</p>
            </fieldset>

            {/* Social */}
            <fieldset className="border-0 p-0 flex flex-col items-center gap-2">
              <legend className="text-xl sm:text-2xl font-semibold text-[#f5f0e6] mb-2 drop-shadow">
                Social
              </legend>
              <a
                href="https://www.linkedin.com/company/shadersweden/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                onMouseEnter={() => sound.playHover()}
                className="text-lg sm:text-xl text-[#e6e4dc] underline underline-offset-4 decoration-white/30 hover:text-white transition-all"
              >
                LinkedIn
              </a>
              <a
                href="https://www.instagram.com/shadersweden/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                onMouseEnter={() => sound.playHover()}
                className="text-lg sm:text-xl text-[#e6e4dc] underline underline-offset-4 decoration-white/30 hover:text-white transition-all"
              >
                Instagram
              </a>
              <a
                href="https://x.com/shadersweden"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                onMouseEnter={() => sound.playHover()}
                className="text-lg sm:text-xl text-[#e6e4dc] underline underline-offset-4 decoration-white/30 hover:text-white transition-all"
              >
                X (Twitter)
              </a>
            </fieldset>
          </div>

          {/* New Business CEO Card */}
          <div className="w-full max-w-2xl mt-16 sm:mt-20">
            <div className="relative w-full rounded-lg p-5 sm:p-7 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 border border-white/20 bg-white/[0.03] backdrop-blur-md shadow-2xl">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded shrink-0 overflow-hidden border border-white/20 bg-black">
                <img
                  src="/textures/simon_calling.webp"
                  alt="Simon, CEO of Shader"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              <div className="flex flex-col text-center sm:text-left">
                <h3 className="text-2xl sm:text-3xl font-semibold text-[#f5f0e6] mb-2">
                  New business
                </h3>
                <p className="text-base sm:text-xl text-[#e6e4dc] leading-snug">
                  Reach out today to our CEO for new business enquiries at{" "}
                  <a
                    href="mailto:ceo@shader.se"
                    onClick={() => sound.playClick()}
                    onMouseEnter={() => sound.playHover()}
                    className="text-white underline underline-offset-4 decoration-white/40 hover:decoration-white font-medium"
                  >
                    ceo@shader.se
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* ── FOOTER BAR (Certification + Shader Logo + Accessibility) ── */}
          <footer
            aria-label="Footer"
            className="w-full max-w-6xl mx-auto mt-20 pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-6 text-center select-none"
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
                &copy; Shader Sweden AB. All Rights Reserved.
              </p>
            </div>

            {/* 3. Accessibility Badge */}
            <div className="w-44 sm:w-56 flex flex-col items-center">
              <Link
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
              </Link>
            </div>
          </footer>
        </section>
      </div>

      {/* Interactive Cal.com Booking Modal */}
      <CalModal
        isOpen={internalCalOpen}
        onClose={() => setInternalCalOpen(false)}
      />
    </div>
  );
}
