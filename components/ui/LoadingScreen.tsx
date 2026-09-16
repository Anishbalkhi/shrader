"use client";

import React, { useEffect, useState, useRef } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  // Start with initial progress so it's instantly active
  const [progress, setProgress] = useState(6);
  const [isFading, setIsFading] = useState(false);
  const [hidden, setHidden] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const totalSegments = 21;

  useEffect(() => {
    let current = 6;
    const timer = setInterval(() => {
      // Natural retro BIOS loading cadence with small jumps
      const increment = Math.random() > 0.35 ? (Math.random() > 0.8 ? 8 : 4) : 2;
      current += increment;

      if (current >= 100) {
        current = 100;
        setProgress(100);
        clearInterval(timer);

        setTimeout(() => {
          setIsFading(true);
          setTimeout(() => {
            setHidden(true);
            onCompleteRef.current();
          }, 650);
        }, 500);
      } else {
        setProgress(current);
      }
    }, 40);

    // Keyboard listener to skip on Space, Enter, or Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSkip = () => {
    setIsFading(true);
    setTimeout(() => {
      setHidden(true);
      onCompleteRef.current();
    }, 280);
  };

  if (hidden) return null;

  // Active segments out of 21 matching shader.se TSL shader formula
  const activeSegments = Math.max(
    1,
    Math.min(totalSegments, Math.floor(((progress + 0.1) / 100) * totalSegments))
  );

  return (
    <div
      onClick={handleSkip}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Shader Development Studio, Website Version 1.02. Loading..."
      className={`fixed inset-0 z-[99999] w-screen h-screen bg-black flex items-center justify-center select-none cursor-pointer overflow-hidden transition-all duration-600 ${
        isFading ? "opacity-0 scale-105 pointer-events-none filter blur-[2px]" : "opacity-100 scale-100"
      }`}
    >
      {/* SVG Definitions for Authentic CRT Barrel Curvature Clip & Bezel */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="crt-tube-mask" clipPathUnits="objectBoundingBox">
            <path d="M 0.045,0.048 C 0.25,0.020 0.75,0.020 0.955,0.048 C 0.980,0.25 0.980,0.75 0.955,0.952 C 0.75,0.980 0.25,0.980 0.045,0.952 C 0.020,0.75 0.020,0.25 0.045,0.048 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Outer CRT Monitor Bezel & Tube */}
      <div
        className="relative w-[calc(100vw-20px)] h-[calc(100vh-20px)] max-w-[1920px] max-h-[1080px] flex items-center justify-center overflow-hidden"
        style={{
          borderRadius: "44px / 36px",
          clipPath: "url(#crt-tube-mask)",
          WebkitClipPath: "url(#crt-tube-mask)",
          background:
            "radial-gradient(ellipse 95% 85% at 50% 48%, #0002ff 0%, #0002e8 42%, #0001ba 70%, #000180 88%, #000040 100%)",
        }}
      >
        {/* Authentic CRT Scanline Overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-20 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0px, rgba(0, 0, 0, 0.4) 1.5px, transparent 1.5px, transparent 3.5px)",
            backgroundSize: "100% 3.5px",
          }}
        />

        {/* CRT Bezel Perimeter Stroke */}
        <svg
          className="pointer-events-none absolute inset-0 w-full h-full z-30"
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
        >
          <path
            d="M 45,29 C 250,12 750,12 955,29 C 980,150 980,450 955,571 C 750,588 250,588 45,571 C 20,450 20,150 45,29 Z"
            fill="none"
            stroke="rgba(8, 6, 28, 0.98)"
            strokeWidth="5"
          />
        </svg>

        {/* Inner Content Layer Scaled to 720x400 Aspect Ratio */}
        <div className="relative z-40 w-full h-full flex items-center justify-center p-2 sm:p-4">
          <div
            className="relative"
            style={{
              aspectRatio: "720 / 400",
              width: "min(100%, calc((100vh - 36px) * 1.8))",
              maxHeight: "92%",
            }}
          >
            {/* Authentic Shader.se White Text Texture Layer (with RGB CRT Aberration) */}
            <img
              src="/textures/boot_screen_white_crt.png"
              alt="SHADER - Shader Development Studio, Website Version 1.02"
              className="w-full h-full object-contain pointer-events-none select-none"
              style={{ imageRendering: "pixelated" }}
            />

            {/* Exact Segmented Loading Bar Container (Aligned precisely to 720x400 coordinates) */}
            <div
              className="absolute z-50 pointer-events-none"
              style={{
                left: "29.305%",
                top: "64.25%",
                width: "41.39%",
                height: "7.5%",
                border: "2px solid #ffffff",
                backgroundColor: "#0002ff",
                boxShadow:
                  "-1.5px 0 0 rgba(255, 30, 70, 0.75), 1.5px 0 0 rgba(30, 220, 255, 0.75), 0 0 8px rgba(255, 255, 255, 0.4)",
                display: "flex",
                padding: "3px 4px",
                gap: "3.5px",
              }}
            >
              {Array.from({ length: totalSegments }).map((_, i) => {
                const filled = i < activeSegments;
                return (
                  <div
                    key={i}
                    className="flex-1 h-full transition-all duration-75"
                    style={{
                      backgroundColor: filled ? "#ffffff" : "transparent",
                      boxShadow: filled
                        ? "-1.2px 0 0 rgba(255, 30, 70, 0.75), 1.2px 0 0 rgba(30, 220, 255, 0.75), 0 0 5px rgba(255, 255, 255, 0.85)"
                        : "none",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Screen Reader Accessibility Description */}
        <span className="sr-only">
          Shader Development Studio, Website Version 1.02. Loading {progress}%. Copyright (c) Shader
          Development Studio AB, 2026. All Rights Reserved.
        </span>
      </div>
    </div>
  );
}
