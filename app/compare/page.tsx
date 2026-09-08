"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dragons from "@/data/dragons.json";
import { Dragon } from "@/types/dragon";
import { getDragonFaction } from "@/data/factions";
import DragonImage from "@/components/DragonImage";

const dragonList = dragons as Dragon[];

export default function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(["2", "28", "4"]); // Balerion, Vhagar, Caraxes default

  const selectedDragons = selectedIds
    .map((id) => dragonList.find((d) => d.id === id))
    .filter(Boolean) as Dragon[];

  const handleSelect = (index: number, id: string) => {
    setSelectedIds((prev) => {
      const next = [...prev];
      next[index] = id;
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-[#08070b] text-white px-4 sm:px-8 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs text-amber-400 hover:underline font-medium mb-1"
            >
              ← Back to Interactive Map
            </Link>
            <h1 className="text-3xl sm:text-5xl font-cinzel font-bold tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-red-400 bg-clip-text text-transparent">
              Dragon Size & Lore Comparator
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Select and compare Targaryen dragons side-by-side across dimensions, rider allegiances, and legendary duels.
            </p>
          </div>

          <div className="flex gap-2">
            {["2", "28", "4"].map((presetId, idx) => (
              <button
                key={presetId}
                onClick={() => setSelectedIds(["2", "28", "4"])}
                className="text-xs bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/40 text-amber-300 px-3 py-1.5 rounded-lg font-cinzel font-semibold transition-all"
              >
                Conquest Trio
              </button>
            ))}
            <button
              onClick={() => setSelectedIds(["1", "28", "9"])}
              className="text-xs bg-red-950/60 hover:bg-red-900/80 border border-red-600/40 text-red-300 px-3 py-1.5 rounded-lg font-cinzel font-semibold transition-all"
            >
              Rook's Rest Clash
            </button>
          </div>
        </div>

        {/* Dropdown Selectors Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-950/80 border border-zinc-900 p-4 rounded-2xl shadow-xl">
          {[0, 1, 2].map((slotIdx) => (
            <div key={slotIdx} className="space-y-1">
              <label className="block text-xs font-cinzel font-bold text-amber-300">
                Dragon #{slotIdx + 1}:
              </label>
              <select
                value={selectedIds[slotIdx] || ""}
                onChange={(e) => handleSelect(slotIdx, e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-xs text-zinc-100 p-2.5 rounded-xl focus:outline-none font-medium"
              >
                {dragonList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.rider ? d.rider.split(",")[0] : "Wild"})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Side-by-side Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {selectedDragons.map((dragon, idx) => {
            const faction = getDragonFaction(dragon.name);
            const isBlendedImage =
              dragon.name.toLowerCase() === "cannibal" ||
              dragon.image.toLowerCase().includes("cannibal") ||
              dragon.image.toLowerCase().includes("greyghost");

            return (
              <div
                key={dragon.id}
                className="bg-zinc-950/70 border border-zinc-900 hover:border-amber-900/40 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-6 backdrop-blur-md transition-all relative overflow-hidden"
              >
                {/* Visual Image & Portrait */}
                <div className="space-y-4">
                  <div className="relative w-full aspect-square bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 border border-zinc-800 rounded-xl p-4 flex items-center justify-center fire-glow overflow-hidden">
                    <DragonImage
                      src={dragon.image}
                      alt={dragon.name}
                      priority
                      isBlendedImage={isBlendedImage}
                      className={`max-h-[240px] w-auto object-contain transition-transform duration-300 hover:scale-105 ${
                        !isBlendedImage ? "filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]" : ""
                      }`}
                    />
                  </div>

                  {/* Header Title & Faction */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-2xl font-cinzel font-bold text-amber-200">
                        {dragon.name}
                      </h2>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${faction.badgeClass}`}>
                        {faction.sigil} {faction.name}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Rider: <span className="text-zinc-200 font-medium">{dragon.rider || "Unbound Wild"}</span>
                    </p>
                  </div>
                </div>

                {/* Specs List */}
                <div className="space-y-3 border-t border-zinc-900 pt-4 text-xs">
                  <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                    <span className="font-cinzel text-amber-400 font-bold block mb-0.5">🎨 Coloration & Features</span>
                    <span className="text-zinc-300">{dragon.colors || "Unknown"}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                      <span className="font-cinzel text-amber-400 font-bold block">🥚 Hatched</span>
                      <span className="text-zinc-300">{dragon.hatched || "Unknown"}</span>
                    </div>
                    <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                      <span className="font-cinzel text-amber-400 font-bold block">⚔️ Demise / Status</span>
                      <span className="text-zinc-300">{dragon.died || "Unknown"}</span>
                    </div>
                  </div>

                  <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                    <span className="font-cinzel text-amber-400 font-bold block">📜 Archival Summary</span>
                    <p className="text-zinc-300 line-clamp-4 leading-relaxed text-[11px]">
                      {dragon.description}
                    </p>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-2">
                  <Link
                    href={`/dragons/${dragon.id}`}
                    className="w-full block text-center py-2 text-xs font-cinzel font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/40 rounded-xl transition-all"
                  >
                    View Full Chronicle →
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

        {/* Famous Historical Duels Showcase */}
        <section className="bg-zinc-950/80 border border-zinc-900 p-6 sm:p-8 rounded-2xl space-y-4">
          <h3 className="text-xl font-cinzel font-bold text-amber-300 flex items-center gap-2">
            <span>⚔️</span> Historical Dragon Duels & Engagements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2">
              <span className="text-amber-400 font-cinzel font-bold text-sm block">
                The Battle Above the Gods Eye (130 AC)
              </span>
              <p className="text-zinc-300 leading-relaxed">
                Prince Daemon Targaryen mounted on <span className="text-red-400 font-semibold">Caraxes</span> challenged Prince Aemond Targaryen on <span className="text-amber-400 font-semibold">Vhagar</span> above Harrenhal. Both dragons locked together in freefall into the Gods Eye lake, ending both behemoths.
              </p>
            </div>

            <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2">
              <span className="text-amber-400 font-cinzel font-bold text-sm block">
                The Clashing of Skirmishers at Rook's Rest
              </span>
              <p className="text-zinc-300 leading-relaxed">
                Princess Rhaenys Targaryen on <span className="text-red-400 font-semibold">Meleys</span> fought both Aegon II on <span className="text-amber-400 font-semibold">Sunfyre</span> and Aemond on <span className="text-emerald-400 font-semibold">Vhagar</span> simultaneously. Meleys severed Sunfyre's wing before crashing to the field.
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
