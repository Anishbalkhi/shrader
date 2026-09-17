"use client";

import React, { useRef, useEffect } from "react";

/**
 * Full-bleed handshake plate.
 *
 * Deliberately stripped versus the previous version:
 *  - no caption block ("Firm handshakes, quiet competence…") — absent from the reference
 *  - no mini gold tie canvas — the reference has nothing at the contact point
 *    except the burst igniting, and the shared-GLTF-scene bug made it steal the
 *    stage tie's model anyway
 *  - poster + preload so the section is never a black hole while the mp4 buffers
 *
 * `zoomRef` is driven by the parent transition so the plate pushes in on scroll,
 * matching the slow dolly in the reference.
 */
export function HandshakeScene({
  zoomRef,
  className = "",
}: {
  zoomRef?: React.MutableRefObject<number>;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const tryPlay = () => videoRef.current?.play().catch(() => {});
    tryPlay();

    if (!zoomRef) return;
    const tick = () => {
      if (frameRef.current) {
        const z = 1 + Math.min(1, Math.max(0, zoomRef.current)) * 0.22;
        frameRef.current.style.transform = `scale(${z.toFixed(4)})`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [zoomRef]);

  return (
    <section
      aria-label="Deal closing handshake"
      className={`relative w-full h-full overflow-hidden bg-[#050608] select-none ${className}`}
    >
      <div ref={frameRef} className="absolute inset-0 will-change-transform" style={{ transformOrigin: "50% 50%" }}>
        <video
          ref={videoRef}
          src="/videos/handshake.mp4"
          poster="/videos/handshake-poster.jpg"
          preload="auto"
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={() => videoRef.current?.play().catch(() => {})}
          className="absolute inset-0 w-full h-full object-cover filter contrast-[1.08] brightness-[0.95]"
        />
      </div>

      {/* Cinematic vignette */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-transparent to-black/45" />
    </section>
  );
}
