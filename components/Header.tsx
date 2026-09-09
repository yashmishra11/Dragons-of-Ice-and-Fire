"use client";

import Link from "next/link";
import { useState } from "react";
import LoginPanel from "@/components/LoginPanel";
import HeaderLogo from "@/components/HeaderLogo";
import dragons from "@/data/dragons.json";

export default function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredDragons = searchTerm.trim()
    ? dragons.filter(
        (d) =>
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (d.rider && d.rider.toLowerCase().includes(searchTerm.toLowerCase()))
      ).slice(0, 6)
    : [];

  const handleSelectDragon = (dragonId: string) => {
    setSearchTerm("");
    setIsOpen(false);
    const element = document.getElementById(`dragon-${dragonId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-2xl border-b border-amber-900/40 px-3 sm:px-6 py-2 transition-all shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Valyrian Crest & Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <HeaderLogo />
          <div>
            <span className="font-cinzel font-bold text-lg sm:text-xl tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-red-400 bg-clip-text text-transparent group-hover:from-amber-100 group-hover:to-red-300 transition-colors drop-shadow-sm">
              DRAGONS OF ICE & FIRE
            </span>
            <span className="block text-[9px] text-zinc-400 tracking-widest uppercase font-cinzel font-semibold">
              Westeros Lore & Compendium
            </span>
          </div>
        </Link>

        {/* Center: Search Bar */}
        <div className="relative flex-1 max-w-xs sm:max-w-sm">
          <div className="relative">
            <svg
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500/70 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search dragon or rider..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 text-xs text-zinc-200 placeholder-zinc-500 rounded-full pl-10 pr-4 py-2 focus:outline-none transition-all shadow-inner"
            />
          </div>

          {/* Search Dropdown */}
          {isOpen && filteredDragons.length > 0 && (
            <div
              className="absolute left-0 right-0 mt-2 bg-zinc-950/95 border border-amber-900/50 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
              onMouseLeave={() => setIsOpen(false)}
            >
              {filteredDragons.map((dragon) => (
                <div key={dragon.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-900 border-b border-zinc-900/50 transition-colors">
                  <button
                    onClick={() => handleSelectDragon(dragon.id)}
                    className="flex-1 text-left"
                  >
                    <span className="font-cinzel text-sm text-amber-300 font-semibold block">
                      {dragon.name}
                    </span>
                    <span className="text-[11px] text-zinc-400 block truncate">
                      Rider: {dragon.rider || "Wild / Unbound"}
                    </span>
                  </button>
                  <Link
                    href={`/dragons/${dragon.id}`}
                    onClick={() => setIsOpen(false)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 bg-amber-950/60 border border-amber-700/40 px-2 py-0.5 rounded hover:bg-amber-900/60 transition-colors"
                  >
                    Details →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Nav & User Panel */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="hidden lg:flex items-center gap-1.5 text-xs font-cinzel font-bold text-zinc-300 hover:text-white hover:bg-zinc-900 px-3 py-1.5 rounded-full transition-all border border-transparent hover:border-zinc-800"
          >
            <span>🗺️</span>
            <span>Map</span>
          </Link>

          <Link
            href="/timeline"
            className="flex items-center gap-1.5 text-xs font-cinzel font-bold text-amber-300 hover:text-amber-200 bg-amber-950/50 hover:bg-amber-900/70 border border-amber-700/40 hover:border-amber-600/60 px-3 py-1.5 rounded-full transition-all shadow-md"
          >
            <span>📜</span>
            <span>Timeline</span>
          </Link>

          <Link
            href="/compare"
            className="flex items-center gap-1.5 text-xs font-cinzel font-bold text-red-300 hover:text-red-200 bg-red-950/40 hover:bg-red-900/60 border border-red-700/40 hover:border-red-600/60 px-3 py-1.5 rounded-full transition-all shadow-md"
          >
            <span>⚔️</span>
            <span className="hidden sm:inline">Compare</span>
          </Link>

          <LoginPanel />
        </div>

      </div>
    </header>
  );
}
