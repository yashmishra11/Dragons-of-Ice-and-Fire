"use client";

import React from "react";

/**
 * WesterosOutlineMap
 * 
 * Slender, ultra-sharp canonical Westeros cartography.
 * Spans from Beyond the Wall down to Dorne in the exact 5350px coordinate space,
 * centered as a thin, elegant spine down the middle between left and right dragon cards.
 * Maintains fixed canonical proportions without squishing or stretching.
 */
export default function WesterosOutlineMap() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none flex justify-center overflow-hidden">
      <img
        src="/map/westeros-ultra-sharp.webp"
        alt="Westeros Map Background"
        className="w-full h-full max-w-[1340px] object-contain object-top opacity-90 drop-shadow-[0_0_24px_rgba(245,158,11,0.18)]"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
