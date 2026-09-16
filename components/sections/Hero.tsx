"use client";

import React from "react";
import { sound } from "@/lib/sound";

interface HeroProps {
  onOpenCal?: () => void;
  scrollProgress?: number;
  onScrollDown?: () => void;
}

export function Hero({ onOpenCal, scrollProgress = 0, onScrollDown }: HeroProps) {
  const handleScrollClick = () => {
    sound.playClick();
    if (onScrollDown) {
      onScrollDown();
    } else {
      const el = document.getElementById("work") || document.getElementById("projects");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const textOpacity = Math.max(0, 1 - scrollProgress * 2.4);
  const textTranslateY = -scrollProgress * 80;

  return (
    <section
      id="hero"
      className="relative h-screen w-full flex flex-col justify-between pt-24 sm:pt-28 pb-10 sm:pb-14 px-8 sm:px-14 lg:px-20 max-w-[1920px] mx-auto z-20 pointer-events-none overflow-hidden"
    >
      {/* Top/Middle Left: Authentic Glowing Headline */}
      <div
        className="flex flex-col justify-center flex-1 max-w-2xl lg:max-w-3xl pointer-events-auto transition-all duration-75"
        style={{
          opacity: textOpacity,
          transform: `translateY(${textTranslateY}px)`,
          pointerEvents: scrollProgress > 0.2 ? "none" : "auto",
        }}
      >
        <h1
          className="font-stix font-normal text-[#fcfbf7] select-none"
          style={{
            fontSize: "clamp(48px, 6.4vw, 102px)",
            lineHeight: 0.94,
            letterSpacing: "-0.015em",
            color: "#fcfbf7",
            textShadow:
              "0 0 30px rgba(255, 238, 200, 0.65), 0 0 70px rgba(255, 215, 140, 0.4), 0 0 110px rgba(120, 160, 255, 0.25)",
            filter:
              "drop-shadow(-0.8px 0 0 rgba(255, 30, 70, 0.5)) drop-shadow(0.8px 0 0 rgba(30, 220, 255, 0.5))",
          }}
        >
          A Creative
          <br />
          Development
          <br />
          Studio,
          <br />
          Plugged into
          <br />
          the Future
        </h1>
      </div>

      {/* Bottom Left: "Scroll to Inspect Our Closed Deals" + 3 Pointing Hand Icons */}
      <div
        className="flex flex-wrap items-end gap-5 sm:gap-7 pointer-events-auto z-20 select-none pb-2 transition-all duration-75"
        style={{
          opacity: textOpacity,
          transform: `translateY(${textTranslateY * 0.7}px)`,
          pointerEvents: scrollProgress > 0.2 ? "none" : "auto",
        }}
      >
        <div
          onClick={handleScrollClick}
          className="cursor-pointer group flex flex-col font-stix text-[#f5f0e6] text-xl sm:text-2xl leading-[1.18] font-normal hover:text-white transition-colors"
          style={{
            textShadow:
              "0 0 20px rgba(255, 235, 190, 0.4), -0.5px 0 rgba(255, 40, 60, 0.4), 0.5px 0 rgba(40, 200, 255, 0.4)",
          }}
        >
          <span>Scroll to Inspect Our</span>
          <span>Closed Deals</span>
        </div>

        {/* 3 Retro Pointing Hand Icons */}
        <div className="flex items-center gap-2 mb-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <img
            src="/textures/icons/pointing_hand_light.svg"
            alt=""
            width={30}
            height={30}
            className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
            draggable={false}
          />
          <img
            src="/textures/icons/pointing_hand_light.svg"
            alt=""
            width={30}
            height={30}
            className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
            draggable={false}
          />
          <img
            src="/textures/icons/pointing_hand_light.svg"
            alt=""
            width={30}
            height={30}
            className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}
