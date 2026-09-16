"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Dragon } from "@/types/dragon";
import { FACTIONS, FactionId, getDragonFaction } from "@/data/factions";
import { EraId, isDragonInEra } from "@/data/timeline";
import DragonImage from "@/components/DragonImage";
import WesterosOutlineMap from "@/components/WesterosOutlineMap";
import { useDragonTransition } from "@/components/DragonTransition";

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
  const { startTransition } = useDragonTransition();
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

  // Canonical Westeros map height with ample breathing room for all 29 dragons
  const FULL_MAP_HEIGHT = 5500;
  const FILTERED_STEP = 280;

  // Collision-free top coordinate mapping for all dragons in full-map mode.
  // Enforces at least 330px vertical separation between consecutive dragons on the same side,
  // ensuring zero card overlap and 100% visibility of all names, badges, and riders.
  const fullMapPositions = useMemo(() => {
    const posMap: Record<string, number> = {};
    const CARD_MIN_GAP = 330;

    for (const side of ["left", "right"] as const) {
      const sideDragons = dragons
        .filter((d) => d.side === side)
        .sort((a, b) => Number(a.top) - Number(b.top));

      let currentTop = side === "left" ? 35 : 180;
      for (const d of sideDragons) {
        const rawTop = Number(d.top);
        const targetTop = Math.round(
          35 + ((rawTop - 140) / (5120 - 140)) * (5100 - 35)
        );
        const assignedTop = Math.max(targetTop, currentTop);
        posMap[d.id] = assignedTop;
        currentTop = assignedTop + CARD_MIN_GAP;
      }
    }
    return posMap;
  }, [dragons]);

  // When filtered, compactly space selected dragons so they are NOT far apart.
  // When 'all', display full map spanning from The Wall to Dorne with ample clearance.
  const sectionHeight = isFiltered
    ? Math.max(780, filteredDragons.length * FILTERED_STEP + 180)
    : FULL_MAP_HEIGHT;

  return (
    <div className="relative w-full bg-[#08070b]">
      {/* Sleek Single-Row House Allegiance Sticky Toolbar */}
      <div className="sticky top-[53px] z-40 bg-zinc-950/95 backdrop-blur-xl border-b border-amber-900/30 px-3 sm:px-6 py-1.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
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
      </div>

      {/* Map Graphic Container - Spanning Natural Westeros Canvas */}
      <section
        className="relative w-full overflow-hidden mx-auto max-w-[1540px] transition-[height] duration-500 ease-out"
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
            const normalizedScale = getNormalizedScale((dragon as Dragon & { scale?: number }).scale);

            // In filtered mode: compact alternating cadence.
            // In full map mode: canonical collision-free positions with min 330px gap.
            const topPosition = isFiltered
              ? 35 + index * FILTERED_STEP
              : fullMapPositions[dragon.id] ?? Number(dragon.top);

            const sideLeft = isFiltered
              ? index % 2 === 0
              : dragon.side === "left";

            return (
              <div
                key={dragon.id}
                id={`dragon-${dragon.id}`}
                className="absolute inset-x-0 w-full transition-all duration-500 z-10 hover:z-30 group will-change-transform pointer-events-none"
                style={{
                  top: `${topPosition}px`,
                  height: "220px",
                }}
              >
                {/* Horizontal Running Cartographic Line across the middle section */}
                <div className="absolute inset-x-0 top-[135px] flex items-center pointer-events-none z-0">
                  {/* Delicate glowing gold cartographic rule */}
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/25 to-transparent group-hover:via-amber-400/50 transition-colors duration-300 shadow-[0_0_8px_rgba(245,158,11,0.15)]" />
                  
                  {/* Subtle antique diamond pip at center */}
                  <div className="absolute left-1/2 -translate-x-1/2 text-[9px] text-amber-500/40 group-hover:text-amber-400/80 transition-colors font-serif select-none">
                    ◆
                  </div>
                </div>

                {/* Dragon Clipart Image on the Flank (Left or Right) */}
                <div
                  className={`absolute top-0 ${
                    sideLeft
                      ? "left-[2%] sm:left-[4%] md:left-[5%]"
                      : "right-[2%] sm:right-[4%] md:right-[5%]"
                  } pointer-events-auto z-10`}
                >
                  <Link
                    href={`/dragons/${dragon.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      startTransition(dragon);
                    }}
                    className="dragon-card-link flex flex-col items-center cursor-pointer"
                  >
                    <div className="relative flex items-center justify-center p-1.5 transition-transform duration-300 group-hover:scale-110">
                      <DragonImage
                        dragonId={dragon.id}
                        src={dragon.image}
                        alt={dragon.name}
                        priority={index < 4}
                        className="dragon-clipart h-[145px] sm:h-[170px] md:h-[180px] max-w-[280px] w-auto object-contain pointer-events-auto"
                        style={{
                          transform: `scale(${normalizedScale})`,
                          transformOrigin: "center center",
                        }}
                      />
                    </div>
                  </Link>
                </div>

                {/* Dragon Name & Badges: Moved on TOP of the horizontal running line in the middle section */}
                <div
                  className={`absolute bottom-[91px] ${
                    sideLeft
                      ? "left-[22%] sm:left-[25%] md:left-[28%]"
                      : "right-[22%] sm:right-[25%] md:right-[28%]"
                  } pointer-events-auto z-20 transition-all duration-300 group-hover:-translate-y-1`}
                >
                  <Link
                    href={`/dragons/${dragon.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      startTransition(dragon);
                    }}
                    className="flex flex-col items-center gap-1 cursor-pointer"
                  >
                    {/* Antique Plaque resting directly atop the horizontal line */}
                    <div className="flex items-center gap-1.5 bg-zinc-950/95 border border-amber-500/40 group-hover:border-amber-400 px-3.5 py-1 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.85),0_0_10px_rgba(245,158,11,0.2)] transition-all">
                      <span className="text-xs">{faction.sigil}</span>
                      <span className="font-cinzel font-bold text-xs sm:text-sm text-amber-200 group-hover:text-amber-100 tracking-wider uppercase whitespace-nowrap">
                        {dragon.name}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${faction.badgeClass}`}>
                        {faction.name}
                      </span>
                    </div>

                    {/* Rider subtitle */}
                    <span className="text-[10px] sm:text-[11px] text-zinc-300 bg-zinc-900/95 px-2.5 py-0.5 rounded border border-zinc-800/80 opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                      {isWild ? "Unbound Dragon" : `Rider: ${dragon.rider}`}
                    </span>

                    {/* Antique gold anchor peg touching the line */}
                    <div className="w-[1px] h-[5px] bg-amber-500/60 -mb-[5px]" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}