"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";

interface SpringMouseState {
  current: { x: number; y: number }; // normalized -1 to 1
  target: { x: number; y: number };
}

const MouseContext = createContext<{
  getMouse: () => { x: number; y: number };
}>({
  getMouse: () => ({ x: 0, y: 0 }),
});

export const useSpringMouse = () => useContext(MouseContext);

export function SpringMouseProvider({ children }: { children: React.ReactNode }) {
  const mouse = useRef<SpringMouseState>({
    current: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
  });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.target.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.target.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        mouse.current.target.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.current.target.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    let animationFrameId: number;
    const stiffness = 0.08;
    const damping = 0.85;
    let vx = 0;
    let vy = 0;

    const tick = () => {
      const dx = mouse.current.target.x - mouse.current.current.x;
      const dy = mouse.current.target.y - mouse.current.current.y;

      vx = (vx + dx * stiffness) * damping;
      vy = (vy + dy * stiffness) * damping;

      mouse.current.current.x += vx;
      mouse.current.current.y += vy;

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const getMouse = () => mouse.current.current;

  return (
    <MouseContext.Provider value={{ getMouse }}>
      {children}
    </MouseContext.Provider>
  );
}
