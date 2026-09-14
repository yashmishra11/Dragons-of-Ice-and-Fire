"use client";

import Link from "next/link";
import { useState } from "react";
import { Dragon } from "@/types/dragon";
import { FACTIONS, FactionId, getDragonFaction } from "@/data/factions";
import { ERAS, EraId, isDragonInEra } from "@/data/timeline";
import DragonImage from "@/components/DragonImage";
import WesterosOutlineMap from "@/components/WesterosOutlineMap";

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

  // Natural proportional Westeros map height (1340x3700 natural aspect ratio 0.362)
  const FULL_MAP_HEIGHT = 3700;
  const FILTERED_STEP = 260;

  // When filtered, compactly space selected dragons so they are NOT far apart.
  // When 'all', display full map spanning from The Wall to Dorne with ample bottom clearance.
  const sectionHeight = isFiltered
    ? Math.max(750, filteredDragons.length * FILTERED_STEP + 180)
    : FULL_MAP_HEIGHT;

  return (
    <div className="relative w-full bg-[#08070b]">
      {/* Sleek Single-Row House Allegiance Sticky Toolbar (No Thick Slider/Scrollbar) */}
      <div className="sticky top-[53px] z-40 bg-zinc-950/95 backdrop-blur-xl border-b border-amber-900/30 px-3 sm:px-6 py-1.5 shadow-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Left: Allegiance House Quick Filter Pills */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-nowrap"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <span className="text-[11px] font-cinzel font-bold text-amber-400/90 tracking-wider uppercase mr-1 hidden sm:inline">
            Allegiance:
          </span>
          {(Object.keys(FACTIONS) as FactionId[]).map((fId) => {
            const fac = FACTIONS[fId];
            const isActive = factionFilter === fId;

            return (
              <button
                key={fId}
                onClick={() => setFactionFilter(fId)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-cinzel transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? fac.colorClass + " border border-amber-400/80 shadow-[0_0_10px_rgba(245,158,11,0.25)] font-bold scale-[1.02]"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 border border-zinc-800/80 bg-zinc-950/80 font-medium"
                }`}
                title={fac.description}
              >
                <span>{fac.sigil}</span>
                <span className="font-semibold">{fac.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Link to Dedicated Timeline Page + Counter & Reset */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/timeline"
            className="flex items-center gap-1.5 text-[11px] font-cinzel font-bold text-amber-300 hover:text-amber-100 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-700/50 px-2.5 py-1 rounded-md transition-all shadow-md"
          >
            <span>📜</span>
            <span>Historical Eras →</span>
          </Link>

          {isFiltered && (
            <button
              onClick={() => {
                setFactionFilter("all");
                setEraFilter("all");
              }}
              className="text-[11px] font-cinzel text-red-400 hover:text-red-300 font-bold bg-red-950/50 hover:bg-red-900/70 px-2 py-1 rounded-md border border-red-800/60 transition-all cursor-pointer flex items-center gap-1"
              title="Reset all active filters"
            >
              <span>Reset</span>
              <span className="text-[10px]">✕</span>
            </button>
          )}

          <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-700/60 px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap">
            {filteredDragons.length} dragons
          </span>
        </div>

      </div>

      {/* Map Graphic Container - Spanning Natural Westeros Canvas */}
      <section
        className="relative w-full overflow-hidden mx-auto max-w-[1340px] transition-[height] duration-500 ease-out"
        style={{ minHeight: `${sectionHeight}px`, height: `${sectionHeight}px` }}
      >
        {/* Proportional Westeros Outline Map (Zero-Lag Vector Background) */}
        <WesterosOutlineMap />

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
            const faction = getDragonFaction(dragon.name);
            const isWild = faction.id === "wild" || !dragon.rider || dragon.rider === "None" || dragon.rider.toLowerCase().includes("none");
            const normalizedScale = getNormalizedScale((dragon as any).scale);

            // Raw top from dragons dataset (ranges from 140 to 5120)
            const rawTop =
              typeof dragon.top === "number"
                ? dragon.top
                : parseInt(dragon.top, 10);

            // Reserve 350px at the bottom so the last dragons (Vhagar & Viserion)
            // have full clearance for their image, name badge, and rider subtitle.
            const maxDragonTop = FULL_MAP_HEIGHT - 350;
            const START_TOP = 15;

            // When filtered: compact sequential cadence so dragons are close together!
            // When all: smoothly mapped canonical positions with minimal top dead space.
            const topPosition = isFiltered
              ? 20 + index * FILTERED_STEP
              : Math.round(START_TOP + ((rawTop - 140) / (5120 - 140)) * (maxDragonTop - START_TOP));

            // When filtered: alternate smoothly left/right. When all: use canonical side.
            const sideLeft = isFiltered
              ? index % 2 === 0
              : dragon.side === "left";

            return (
              <div
                key={dragon.id}
                id={`dragon-${dragon.id}`}
                className="absolute transition-all duration-500 z-10 hover:z-30 will-change-transform"
                style={{
                  top: `${topPosition}px`,
                  left: sideLeft ? "7%" : "93%",
                  transform: sideLeft ? "translateX(0)" : "translateX(-100%)",
                }}
              >
                <Link
                  href={`/dragons/${dragon.id}`}
                  className="dragon-card-link group flex flex-col items-center pointer-events-auto cursor-pointer"
                >
                  {/* Visual Dragon Image Container with Smooth Scaling */}
                  <div className="relative flex items-center justify-center p-2 transition-transform duration-300 group-hover:scale-110">
                    <DragonImage
                      dragonId={dragon.id}
                      src={dragon.image}
                      alt={dragon.name}
                      priority={index < 4}
                      className="dragon-clipart h-[180px] sm:h-[220px] max-w-[320px] w-auto object-contain pointer-events-auto"
                      style={{
                        transform: `scale(${normalizedScale})`,
                        transformOrigin: "center center",
                      }}
                    />
                  </div>

                  {/* Dragon Label & Badge */}
                  <div className="mt-2 flex flex-col items-center gap-1 transition-all duration-300 group-hover:-translate-y-1">
                    <div className="flex items-center gap-1.5 bg-zinc-950/95 border border-amber-500/30 group-hover:border-amber-400 px-3 py-1 rounded-full shadow-xl">
                      <span className="text-xs">{faction.sigil}</span>
                      <span className="font-cinzel font-bold text-xs sm:text-sm text-amber-200 group-hover:text-amber-100 whitespace-nowrap">
                        {dragon.name}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${faction.badgeClass}`}>
                        {faction.name}
                      </span>
                    </div>

                    {/* Rider subtitle on hover */}
                    <span className="text-[11px] text-zinc-300 bg-zinc-900/95 px-2 py-0.5 rounded border border-zinc-800 opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
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