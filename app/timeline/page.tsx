"use client";

import { useState } from "react";
import Link from "next/link";
import dragons from "@/data/dragons.json";
import { Dragon } from "@/types/dragon";
import { ERAS, EraId, isDragonInEra } from "@/data/timeline";
import { getDragonFaction } from "@/data/factions";
import DragonImage from "@/components/DragonImage";

const dragonList = dragons as Dragon[];

export default function TimelinePage() {
  const [selectedEra, setSelectedEra] = useState<EraId>("all");

  const currentEra = ERAS[selectedEra];

  const eraDragons = dragonList.filter((d) => isDragonInEra(d.name, selectedEra));

  return (
    <main className="min-h-screen bg-[#08070b] text-white px-4 sm:px-8 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs text-amber-400 hover:underline font-medium mb-1"
            >
              ← Back to Interactive Map
            </Link>
            <h1 className="text-3xl sm:text-5xl font-cinzel font-bold tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-red-400 bg-clip-text text-transparent">
              Westeros Dragon Timeline & Eras
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Explore the chronological history of dragons from the Valyrian Freehold to the Reign of Daenerys Targaryen.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-800/60 px-3 py-1.5 rounded-full shadow-lg">
              {eraDragons.length} dragons in timeline
            </span>
          </div>
        </div>

        {/* Interactive Timeline Era Selector */}
        <div className="bg-zinc-950/90 border border-amber-900/40 p-4 rounded-2xl shadow-2xl space-y-4">
          <h2 className="text-xs font-cinzel font-bold text-amber-300 tracking-wider uppercase">
            Select Historical Era:
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {(Object.keys(ERAS) as EraId[]).map((eId) => {
              const era = ERAS[eId];
              const isActive = selectedEra === eId;

              return (
                <button
                  key={eId}
                  onClick={() => setSelectedEra(eId)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isActive
                      ? "bg-amber-950/90 border-amber-500 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-105 font-bold"
                      : "bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 font-medium"
                  }`}
                >
                  <span className="text-2xl mb-1">{era.icon}</span>
                  <span className="font-cinzel text-xs">{era.title}</span>
                  <span className="text-[10px] text-amber-400/80 font-mono mt-0.5">
                    {era.years}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Era Highlight Card */}
        <div className="bg-gradient-to-r from-amber-950/40 via-zinc-950 to-zinc-950 border border-amber-800/40 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{currentEra.icon}</span>
              <h2 className="text-2xl font-cinzel font-bold text-amber-200">
                {currentEra.title}
              </h2>
              <span className="text-xs font-mono bg-amber-950 border border-amber-700/60 text-amber-300 px-2.5 py-0.5 rounded-full">
                {currentEra.years}
              </span>
            </div>
            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              {currentEra.description}
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="text-xs font-cinzel text-amber-400/90 font-bold bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800 block text-center">
              📜 {eraDragons.length} Recorded Dragons
            </span>
          </div>
        </div>

        {/* Dragon Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eraDragons.map((dragon) => {
            const faction = getDragonFaction(dragon.name);
            const isBlendedImage =
              dragon.name.toLowerCase() === "cannibal" ||
              dragon.image.toLowerCase().includes("cannibal") ||
              dragon.image.toLowerCase().includes("greyghost");

            return (
              <div
                key={dragon.id}
                className="bg-zinc-950/80 border border-zinc-900 hover:border-amber-900/50 rounded-2xl p-5 shadow-2xl flex flex-col justify-between space-y-4 backdrop-blur-md transition-all group hover:-translate-y-1"
              >
                {/* Visual Image Header */}
                <div className="space-y-3">
                  <div className="relative w-full aspect-video bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-center overflow-hidden fire-glow">
                    <DragonImage
                      src={dragon.image}
                      alt={dragon.name}
                      priority
                      isBlendedImage={isBlendedImage}
                      className={`max-h-[160px] w-auto object-contain transition-transform duration-300 group-hover:scale-105 ${
                        !isBlendedImage ? "drop-shadow-[0_8px_15px_rgba(0,0,0,0.8)]" : ""
                      }`}
                    />
                  </div>

                  {/* Title & Faction Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xl font-cinzel font-bold text-amber-200 group-hover:text-amber-100 transition-colors">
                        {dragon.name}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${faction.badgeClass}`}>
                        {faction.sigil} {faction.name}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Rider: <span className="text-zinc-200 font-medium">{dragon.rider || "Unbound Wild Dragon"}</span>
                    </p>
                  </div>
                </div>

                {/* Lore Specs */}
                <div className="space-y-2 text-xs border-t border-zinc-900 pt-3">
                  <div className="flex justify-between text-[11px] bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/60">
                    <span className="text-zinc-400 font-cinzel">Hatches:</span>
                    <span className="text-zinc-200 font-medium">{dragon.hatched || "Ancient"}</span>
                  </div>
                  <div className="flex justify-between text-[11px] bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/60">
                    <span className="text-zinc-400 font-cinzel">Status:</span>
                    <span className="text-amber-300 font-medium">{dragon.died || "Unknown"}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-3 leading-relaxed pt-1">
                    {dragon.description}
                  </p>
                </div>

                {/* Footer Action */}
                <Link
                  href={`/dragons/${dragon.id}`}
                  className="w-full block text-center py-2 text-xs font-cinzel font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/40 rounded-xl transition-all"
                >
                  View Full Chronicle →
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}
