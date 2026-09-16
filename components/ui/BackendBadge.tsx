"use client";

import React from "react";
import { Cpu, Zap } from "lucide-react";

interface BackendBadgeProps {
  backend: "WebGPU" | "WebGL";
}

export function BackendBadge({ backend }: BackendBadgeProps) {
  const isGPU = backend === "WebGPU";

  return (
    <div className="fixed bottom-6 right-6 z-40 pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/15 text-xs font-mono text-white/90 shadow-2xl transition-all hover:scale-105 hover:border-white/30">
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isGPU ? "bg-emerald-400" : "bg-amber-400"
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isGPU ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
      </span>

      <span className="tracking-wider uppercase font-semibold text-[11px] flex items-center gap-1.5">
        {isGPU ? <Cpu className="w-3 h-3 text-emerald-400" /> : <Zap className="w-3 h-3 text-amber-400" />}
        <span>{backend}</span>
      </span>
    </div>
  );
}
