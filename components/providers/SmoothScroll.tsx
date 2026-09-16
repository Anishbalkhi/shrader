"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import Lenis from "lenis";

interface ScrollContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: any) => void;
}

const ScrollContext = createContext<ScrollContextType>({
  lenis: null,
  scrollTo: () => {},
});

export const useScroll = () => useContext(ScrollContext);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    // Update custom CSS --vh variable on resize
    const setVh = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight / 100}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", setVh);
      lenis.destroy();
    };
  }, []);

  const scrollTo = (target: string | number | HTMLElement, options?: any) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options);
    }
  };

  return (
    <ScrollContext.Provider value={{ lenis: lenisRef.current, scrollTo }}>
      {children}
    </ScrollContext.Provider>
  );
}
