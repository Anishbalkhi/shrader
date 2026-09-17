"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useScroll, useMotionValue } from "framer-motion";
import { sound } from "@/lib/sound";
import { Navigation } from "@/components/ui/Navigation";
import { CRTFilterOverlay } from "@/components/ui";
import { CalModal } from "@/components/modals";

// Dynamic 3D Scenes for SSR safety
const PagePeelScene = dynamic(
  () => import("@/components/canvas/PagePeelScene").then((m) => m.PagePeelScene),
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

function PagePeelSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressMotion = useMotionValue(0);

  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const autoResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let animId: number;

    const updatePhysics = () => {
      // Smooth spring damping towards target progress
      const diff = targetProgressRef.current - currentProgressRef.current;
      currentProgressRef.current += diff * 0.12;
      if (Math.abs(diff) < 0.001) {
        currentProgressRef.current = targetProgressRef.current;
      }
      progressMotion.set(currentProgressRef.current);
      animId = requestAnimationFrame(updatePhysics);
    };
    animId = requestAnimationFrame(updatePhysics);

    // Wheel listener specifically capturing reverse (upward) scroll
    const handleWheel = (e: WheelEvent) => {
      if (window.scrollY <= 12) {
        // Scrolling in reverse / upward direction (wheel up)
        if (e.deltaY < 0) {
          e.preventDefault();
          const delta = (-e.deltaY) * 0.0022;
          targetProgressRef.current = Math.min(1.0, targetProgressRef.current + delta);

          if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);
          // Gently auto-settle back to flat after 2.5s if left untouched
          autoResetTimerRef.current = setTimeout(() => {
            targetProgressRef.current = 0;
          }, 2500);
        } else if (e.deltaY > 0 && targetProgressRef.current > 0.01) {
          // If sheet was peeled in reverse and user scrolls downward, roll it back down
          e.preventDefault();
          const delta = e.deltaY * 0.0025;
          targetProgressRef.current = Math.max(0, targetProgressRef.current - delta);
          if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);
        } else {
          // Normal downward scroll: keep flat (progress = 0)
          targetProgressRef.current = 0;
        }
      } else {
        // Scrolled down the page: keep flat
        targetProgressRef.current = 0;
      }
    };

    // Touch / trackpad swipe handling for reverse scroll
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY <= 5 && e.touches.length > 0) {
        const touchY = e.touches[0].clientY;
        const diffY = touchY - touchStartY; // positive when dragging down (reverse scroll at top)
        if (diffY > 12) {
          e.preventDefault();
          targetProgressRef.current = Math.min(1.0, (diffY - 12) * 0.0035);
          if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);
        } else if (targetProgressRef.current > 0.02 && diffY < -10) {
          targetProgressRef.current = Math.max(0, targetProgressRef.current - 0.06);
        }
      }
    };

    const handleTouchEnd = () => {
      if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);
      autoResetTimerRef.current = setTimeout(() => {
        targetProgressRef.current = 0;
      }, 1800);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [progressMotion]);

  return (
    <section
      ref={containerRef}
      aria-label="3D Cubicle Matrix to Team Banner Page Curl Transition"
      className="relative w-full overflow-hidden bg-[#090a0d]"
      style={{ height: "78dvh", minHeight: "560px", maxHeight: "800px" }}
    >
      <PagePeelScene progress={progressMotion} />
    </section>
  );
}

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
    if (typeof window !== "undefined") {
      window.location.hash = "contact";
    }
    setIsShredding(true);
    // Smoothly scroll to the dark finale underneath as the shred wipe tears the page apart
    setTimeout(() => {
      const el = document.getElementById("contact") || document.getElementById("shred-payoff");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 450);

    setTimeout(() => {
      setIsShredded(true);
      setIsShredding(false);
    }, 1900);
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
            className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end bg-black/50 overflow-hidden"
          >
            {/* SVG Turbulence Filter for Wavy/Torn Physical Paper Edges */}
            <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
              <defs>
                <filter id="wavy-shred-edge">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.04 0.15"
                    numOctaves="2"
                    result="noise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="12"
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                </filter>
              </defs>
            </svg>

            {/* Shredder Header Warning Banner */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-700/95 text-white font-mono text-xs sm:text-sm tracking-widest uppercase px-6 py-2.5 rounded shadow-2xl z-20 flex items-center gap-2 border border-red-500/30">
              <span className="inline-block w-2 h-2 rounded-full bg-red-300 animate-ping" />
              <span>EXECUTING MECHANICAL DOCUMENT SHREDDER...</span>
            </div>

            {/* Wavy Torn Vertical Paper Ribbons tearing downward */}
            <div
              className="w-full h-full flex overflow-hidden"
              style={{ filter: "url(#wavy-shred-edge)" }}
            >
              {Array.from({ length: 32 }).map((_, i) => {
                const isDarkRibbon = i % 3 === 2;
                const delay = (i % 6) * 0.08 + Math.abs(Math.sin(i * 0.5)) * 0.14;
                const randomRotate = (i % 2 === 0 ? 1 : -1) * ((i % 4) + 1.2);
                return (
                  <motion.div
                    key={i}
                    initial={{ y: "0%", rotate: 0 }}
                    animate={{
                      y: ["0%", "5%", "135%"],
                      rotate: [0, randomRotate * 0.3, randomRotate],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: delay,
                      ease: [0.36, 0, 0.66, -0.05],
                    }}
                    className="h-[120vh] flex-1 border-r border-black/15 shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
                    style={{
                      backgroundColor: isDarkRibbon
                        ? "#111217"
                        : i % 2 === 0
                        ? "#EFE9D3"
                        : "#E8E2CB",
                    }}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1 & 2. 3D CUBICLE MATRIX TO TEAM BANNER PAGE CURL & PEEL TRANSITION ── */}
      <PagePeelSection />

      {/* ── 3. NARRATIVE ARC: PART 1 & 2 (Sincere Pitch + Capabilities + The Hinge Line) ── */}
      <section
        aria-label="About Us"
        className="relative w-full max-w-[1480px] mx-auto px-6 sm:px-12 lg:px-16 pt-10 sm:pt-16 pb-16 sm:pb-24 flex flex-col items-center"
      >
        {/* Main Headline with authentic multi-line editorial breaks & warm letterpress drop shadow */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="font-stix text-center text-[#221e1a] tracking-[-0.02em] max-w-[1380px] mx-auto select-none"
          style={{
            fontSize: "clamp(46px, 5.6vw, 84px)",
            fontWeight: 400,
            lineHeight: 1.02,
            textShadow: "0 3px 14px rgba(160, 95, 30, 0.28), 0 1px 2px rgba(100, 50, 10, 0.35)",
          }}
        >
          <span className="block">Making Digital</span>
          <span className="block">Storytelling More Playful,</span>
          <span className="block">Powerful, and Alive</span>
        </motion.h1>

        {/* 3-Column Story Structure */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="relative w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 mt-12 sm:mt-16 font-stix"
        >
          {/* Column 1: Opening — Sincere & Concrete ("Who we are") */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col gap-6 text-[#2c2822] text-[15.5px] sm:text-[16.5px] lg:text-[17.5px] leading-[1.56]"
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
            className="text-[#2c2822] text-[15.5px] sm:text-[16.5px] lg:text-[17.5px] leading-[1.56]"
          >
            <p>
              <span className="text-[#151412] font-semibold">
                This modular approach
              </span>{" "}
              means we can scale and adapt to each challenge. Whether it&apos;s a
              WebGL experiment, an interactive product visualization, a mobile
              app, or an AI-driven experience, we help bold brands stand out
              across every screen. We build storytelling platforms that demand
              attention and reward curiosity. We push digital mediums to places
              you haven&apos;t seen before, and have fun doing it. Beyond code, we
              offer 3D design and animation, UI and motion design, concepts and
              digital strategy, full-stack development, and creative consulting.
            </p>
          </motion.div>

          {/* Column 3: The Hinge Line + Jacob at Computer (Natural text-wrap around floated cutout) */}
          <motion.div
            variants={fadeInUp}
            className="font-stix text-[#2c2822] text-[15.5px] sm:text-[16.5px] lg:text-[17.5px] leading-[1.56]"
          >
            <p>
              Whether it&apos;s prototyping an idea, launching an augmented
              reality experience, or bringing high-fidelity visuals to life,
              Shader bridges the gap between creative ambition and technical
              execution. Our process is hands-on, collaborative, and tailored for
              teams that value both craft and innovation. We{" "}
              <span className="float-right ml-4 mb-2 -mr-2 sm:-mr-4 w-[180px] sm:w-[205px] lg:w-[235px] block select-none pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.16)]">
                <img
                  src="/textures/jake_computer.webp"
                  alt="Jacob sitting at retro computer holding printout"
                  className="w-full h-auto object-contain block"
                  draggable={false}
                />
              </span>
              combine technical expertise with a designer&apos;s eye, ensuring
              that every interaction feels natural and every pixel is perfectly
              placed. We&apos;re not your regular IT department. We don&apos;t
              troubleshoot printers.
            </p>
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

      {/* ── 7.5 STANDALONE FLOATING SECOND LOGO LOCKUP BADGE ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: false, margin: "-40px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 -mb-6 sm:-mb-8 w-full flex justify-center px-4"
      >
        <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 bg-[#FAF7EF]/95 backdrop-blur-md px-6 sm:px-9 py-3.5 sm:py-4 rounded-2xl border border-black/15 shadow-[0_12px_36px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_44px_rgba(0,0,0,0.14)] hover:-translate-y-0.5 transition-all group">
          <img
            src="/textures/logo_dark.svg"
            alt="SHADER"
            className="h-6 sm:h-7 w-auto object-contain opacity-90 group-hover:scale-105 transition-transform"
          />
          <div className="hidden sm:block h-5 w-[1px] bg-black/20" />
          <span className="font-stix italic text-sm sm:text-base md:text-lg text-[#322f2b] tracking-wide">
            A High Tech Business Solutions Company
          </span>
          <div className="w-8 sm:w-9 shrink-0 opacity-85 group-hover:opacity-100 transition-opacity drop-shadow-sm">
            <img
              src="/textures/computer_narrow.webp"
              alt="Retro Terminal"
              className="w-full h-auto object-contain"
              draggable={false}
            />
          </div>
        </div>
      </motion.div>

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
              className={`relative w-full max-w-[520px] drop-shadow-[0_15px_30px_rgba(0,0,0,0.18)] transition-all duration-500 cursor-pointer ${isShredded
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

      {/* ── 10. SHRED PAYOFF: GOLDEN TIE & HANDSHAKE CEREMONY ── */}
      <div id="contact" data-section="shred-payoff" className="relative w-full bg-[#07080a] text-white">
        {/* Golden Tie Mock Award Ceremony */}
        <GoldenTieScene onOpenCal={handleOpenCal} />

        {/* Handshake Close-up: Hands closing a deal */}
        <HandshakeScene />
      </div>

      {/* Interactive Cal.com Booking Modal */}
      <CalModal
        isOpen={internalCalOpen}
        onClose={() => setInternalCalOpen(false)}
      />
    </div>
  );
}