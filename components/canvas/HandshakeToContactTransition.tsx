"use client";

import React, { useRef, useEffect } from "react";
import { useScroll } from "framer-motion";
import { HandshakeScene } from "./HandshakeScene";

// Organic 16-point torn burst, normalised around r = 100
const BURST_PATH_D =
  "M 0,-100 L 8.19,-41.19 L 45.16,-109.02 L 21.11,-31.6 L 65.05,-65.05 L 43.24,-28.89 L 115.48,-47.84 L 35.31,-7.02 L 85,0 L 44.14,8.78 L 106.25,44.01 L 28.27,18.89 L 69.3,69.3 L 26.67,39.91 L 46.69,112.71 L 7.61,38.25 L 0,88 L -8.58,43.15 L -45.92,110.87 L -19.44,29.1 L -66.47,66.47 L -41.57,27.78 L -107.17,44.39 L -36.29,7.22 L -86,0 L -45.12,-8.97 L -114.56,-47.45 L -29.93,-20 L -63.64,-63.64 L -26.11,-39.08 L -42.86,-103.47 L -7.8,-39.23 Z";

/** Tightest concave vertex of BURST_PATH_D is 35.31,-7.02 → r ≈ 36. */
const BURST_INNER_R = 36;
const COVER_SAFETY = 1.14;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function HandshakeToContactTransition({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const clipPathRef = useRef<SVGPathElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const nextSectionRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(0);
  const lastProgress = useRef(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const updateWipe = (progress: number) => {
      lastProgress.current = progress;
      zoomRef.current = progress;

      if (!clipPathRef.current || !nextSectionRef.current || !bloomRef.current) return;

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Contact point of the clasped hands. Tune to your plate — it is NOT
      // dead centre in the reference footage, it sits slightly low.
      const originX = w * 0.5;
      const originY = h * 0.52;

      const finalScale = (Math.hypot(w, h) / 2 / BURST_INNER_R) * COVER_SAFETY;

      if (progress <= 0.12) {
        clipPathRef.current.setAttribute("transform", `translate(${originX}, ${originY}) scale(0.0001)`);
        bloomRef.current.style.opacity = "0";
        nextSectionRef.current.style.pointerEvents = "none";
        nextSectionRef.current.style.visibility = "hidden";
        return;
      }

      nextSectionRef.current.style.visibility = "visible";

      // Burst opens over 0.12 → 0.58, leaving the rest of the track as hold.
      const t = clamp01((progress - 0.12) / 0.46);
      const eased = t * t * (3.0 - 2.0 * t);
      const scale = 0.04 + eased * finalScale;
      const rot = eased * 22;

      clipPathRef.current.setAttribute(
        "transform",
        `translate(${originX}, ${originY}) scale(${scale}) rotate(${rot})`
      );

      // White-hot bloom at the contact point: blooms in fast, blows out, then
      // dies as the burst outgrows it. This is the glow in the reference.
      const bloomIn = smoothstep(0.0, 0.18, t);
      const bloomOut = 1 - smoothstep(0.42, 0.78, t);
      const bloomSize = 120 + eased * 900;
      bloomRef.current.style.opacity = String(bloomIn * bloomOut);
      bloomRef.current.style.left = `${originX}px`;
      bloomRef.current.style.top = `${originY}px`;
      bloomRef.current.style.width = `${bloomSize}px`;
      bloomRef.current.style.height = `${bloomSize}px`;

      nextSectionRef.current.style.pointerEvents = t >= 0.99 ? "auto" : "none";
    };

    const onResize = () => updateWipe(lastProgress.current);
    window.addEventListener("resize", onResize);
    const unsub = scrollYProgress.on("change", updateWipe);
    updateWipe(scrollYProgress.get());

    return () => {
      window.removeEventListener("resize", onResize);
      unsub();
    };
  }, [scrollYProgress]);

  return (
    <div
      ref={trackRef}
      aria-label="Handshake to contact burst transition"
      className="relative w-full select-none"
      style={{ height: "300dvh" }}
    >
      <div className="sticky top-0 w-full overflow-hidden" style={{ height: "100dvh" }}>
        <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
          <defs>
            <clipPath id="handshake-burst-clip" clipPathUnits="userSpaceOnUse">
              <path ref={clipPathRef} d={BURST_PATH_D} />
            </clipPath>
          </defs>
        </svg>

        {/* LAYER 1 — handshake plate, pushing in on scroll */}
        <div className="absolute inset-0 w-full h-full z-10">
          <HandshakeScene zoomRef={zoomRef} />
        </div>

        {/* LAYER 2 — white-hot bloom igniting between the hands */}
        <div
          ref={bloomRef}
          aria-hidden="true"
          className="absolute pointer-events-none z-20 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            opacity: 0,
            background:
              "radial-gradient(circle, #ffffff 0%, #fffdf4 24%, rgba(255,240,196,0.55) 48%, rgba(255,214,120,0) 72%)",
            filter: "blur(10px)",
            mixBlendMode: "screen",
          }}
        />

        {/* LAYER 3 — next section revealed under the burst mask */}
        <div
          ref={nextSectionRef}
          className="absolute inset-0 w-full h-full z-30 overflow-hidden"
          style={{
            clipPath: "url(#handshake-burst-clip)",
            WebkitClipPath: "url(#handshake-burst-clip)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
