"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Dragon } from "@/types/dragon";
import { FACTIONS, FactionId, getDragonFaction } from "@/data/factions";
import { ERAS, EraId, isDragonInEra } from "@/data/timeline";
import DragonImage from "@/components/DragonImage";

type MapSectionProps = {
  dragons: Dragon[];
};

/**
  Normalizes legacy dragon scale values from dragons.json so all dragon images
  display consistently in size on the website map without exploding to 1000px+.
 */
function getNormalizedScale(rawScale?: number | null): number {
  if (!rawScale || isNaN(rawScale)) return 1.0;

  // Legacy large scale values (3.0 to 6.5) in dataset
  if (rawScale >= 3) {
    // Map 3.0 - 6.5 smoothly into a balanced relative scale range of 1.12 to 1.30
    return 1.12 + (Math.min(rawScale, 6.5) - 3) * (0.18 / 3.5);
  }

  // Standard scale range (e.g. 0.8 to 2.0) - clamp within [0.85, 1.25]
  return Math.min(1.25, Math.max(0.85, rawScale));
}

export default function MapSection({ dragons }: MapSectionProps) {
  const [factionFilter, setFactionFilter] = useState<FactionId>("all");
  const [eraFilter, setEraFilter] = useState<EraId>("all");
  const [hoveredDragon, setHoveredDragon] = useState<string | null>(null);

  const filteredDragons = dragons.filter((d) => {
    if (factionFilter !== "all") {
      const faction = getDragonFaction(d.name);
      if (faction.id !== factionFilter) return false;
    }

    if (eraFilter !== "all") {
      if (!isDragonInEra(d.name, eraFilter)) return false;
    }

    return true;
  });

  const isFiltered = factionFilter !== "all" || eraFilter !== "all";

  // Dynamic section height calculation
  const compactSectionHeight = Math.max(700, filteredDragons.length * 280 + 160);

  return (
    <div className="relative w-full bg-[#08070b]">
      {/* Ultra-Slim Single-Line Sticky Controls Bar (42px total height) */}
      <div className="sticky top-[53px] z-40 flex items-center justify-between px-3 sm:px-6 py-1.5 bg-black/90 backdrop-blur-md border-b border-zinc-800/80 text-xs shadow-xl">
        
        {/* Left: Era Dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 font-cinzel font-bold text-[11px] hidden sm:inline">
            Era:
          </span>
          <select
            value={eraFilter}
            onChange={(e) => setEraFilter(e.target.value as EraId)}
            className="bg-zinc-900 border border-zinc-800 focus:border-amber-500/50 text-[11px] text-amber-300 font-cinzel rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
          >
            {(Object.keys(ERAS) as EraId[]).map((eId) => (
              <option key={eId} value={eId}>
                {ERAS[eId].icon} {ERAS[eId].title} ({ERAS[eId].years})
              </option>
            ))}
          </select>
        </div>

        {/* Center: Allegiance Quick Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-xl">
          {(Object.keys(FACTIONS) as FactionId[]).map((fId) => {
            const fac = FACTIONS[fId];
            const isActive = factionFilter === fId;

            return (
              <button
                key={fId}
                onClick={() => setFactionFilter(fId)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-cinzel transition-all whitespace-nowrap ${
                  isActive
                    ? fac.colorClass + " border shadow"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent"
                }`}
                title={fac.description}
              >
                <span>{fac.sigil}</span>
                <span className="hidden md:inline ml-1 font-semibold">{fac.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Counter & Reset */}
        <div className="flex items-center gap-2">
          {isFiltered && (
            <button
              onClick={() => {
                setFactionFilter("all");
                setEraFilter("all");
              }}
              className="text-[10px] text-red-400 hover:text-red-300 font-bold bg-red-950/40 hover:bg-red-900/60 px-2 py-0.5 rounded border border-red-800/40 transition-colors"
            >
              Reset ✕
            </button>
          )}
          <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/70 border border-amber-800/50 px-2 py-0.5 rounded-full">
            {filteredDragons.length} dragons
          </span>
        </div>

      </div>

      {/* Map Graphic Container */}
      <section
        className="relative w-full overflow-hidden mx-auto max-w-[1400px] transition-all duration-500"
        style={
          isFiltered
            ? { height: `${compactSectionHeight}px` }
            : { aspectRatio: "1272 / 5350" }
        }
      >
        <Image
          src="/map/bg.jpeg"
          fill
          className="object-cover opacity-90"
          alt="Westeros Map Background"
          priority
        />

        {/* Soft background vignette & blur */}
        <div className="absolute inset-0 backdrop-blur-[2px] bg-black/20 pointer-events-none" />

        {filteredDragons.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-2 z-20 relative">
            <span className="text-4xl">📜</span>
            <p className="font-cinzel text-amber-300 text-sm font-bold">
              No dragons recorded for selected era/faction filter.
            </p>
            <button
              onClick={() => {
                setFactionFilter("all");
                setEraFilter("all");
              }}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              Clear filters to view all dragons
            </button>
          </div>
        ) : (
          filteredDragons.map((dragon, index) => {
            const isHovered = hoveredDragon === dragon.id;
            const faction = getDragonFaction(dragon.name);
            const isWild = faction.id === "wild" || !dragon.rider || dragon.rider === "None" || dragon.rider.toLowerCase().includes("none");
            const isBlendedImage =
              dragon.name.toLowerCase() === "cannibal" ||
              dragon.image.toLowerCase().includes("cannibal") ||
              dragon.image.toLowerCase().includes("greyghost");

            const normalizedScale = getNormalizedScale((dragon as any).scale);

            // Calculate top position: map coordinates for 'all', compact flow for filtered
            const topPosition = isFiltered
              ? 60 + index * 280
              : typeof dragon.top === "number"
              ? dragon.top
              : parseInt(dragon.top, 10);

            // Calculate side position: alternating left/right in compact mode, original side in full map
            const sideLeft = isFiltered
              ? index % 2 === 0
              : dragon.side === "left";

            return (
              <div
                key={dragon.id}
                id={`dragon-${dragon.id}`}
                className="absolute transition-all duration-500 z-10 hover:z-30"
                style={{
                  top: `${topPosition}px`,
                  left: sideLeft ? "4%" : "92%",
                  transform: sideLeft ? "translateX(0)" : "translateX(-100%)",
                }}
                onMouseEnter={() => setHoveredDragon(dragon.id)}
                onMouseLeave={() => setHoveredDragon(null)}
              >
                <Link
                  href={`/dragons/${dragon.id}`}
                  className="group flex flex-col items-center pointer-events-auto cursor-pointer"
                >
                  {/* Visual Dragon Image Container */}
                  <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <DragonImage
                      src={dragon.image}
                      alt={dragon.name}
                      priority={index < 6}
                      isBlendedImage={isBlendedImage}
                      className={`h-[180px] sm:h-[220px] max-w-[320px] w-auto object-contain ${
                        isHovered && !isBlendedImage
                          ? "drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] brightness-110"
                          : !isBlendedImage
                          ? "drop-shadow-[0_8px_12px_rgba(0,0,0,0.8)]"
                          : ""
                      }`}
                      style={{
                        transform: `scale(${normalizedScale})`,
                        transformOrigin: "center center",
                      }}
                    />
                  </div>

                  {/* Dragon Label & Badge */}
                  <div className="mt-2 flex flex-col items-center gap-1 transition-all duration-300 group-hover:-translate-y-1">
                    <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur-md border border-amber-500/30 group-hover:border-amber-400 px-3 py-1 rounded-full shadow-xl">
                      <span className="text-xs">{faction.sigil}</span>
                      <span className="font-cinzel font-bold text-xs sm:text-sm text-amber-200 group-hover:text-amber-100 whitespace-nowrap">
                        {dragon.name}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${faction.badgeClass}`}>
                        {faction.name}
                      </span>
                    </div>

                    {/* Rider subtitle on hover */}
                    <span className="text-[11px] text-zinc-300 bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                      {isWild ? "Unbound Dragon" : `Rider: ${dragon.rider}`}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}