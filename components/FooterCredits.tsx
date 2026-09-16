"use client";

import { useState, useEffect } from "react";

export default function FooterCredits() {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <footer className="border-t border-zinc-900/80 bg-black/95 py-6 px-4 text-center text-xs text-zinc-400 font-cinzel select-none">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          
          {/* Left: Project Copyright */}
          <div>
            <p className="text-zinc-300 font-medium">
              Dragons of Ice &amp; Fire &copy; {new Date().getFullYear()}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              A Song of Ice and Fire &amp; House of the Dragon Interactive Archive
            </p>
          </div>

          {/* Right: Subtle Citadel Sources & Artist Attributions Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 text-amber-300 hover:text-amber-200 text-xs font-cinzel transition-all shadow-md cursor-pointer group"
              aria-label="Open Citadel sources and artist attributions"
            >
              <span className="text-sm">📜</span>
              <span className="underline underline-offset-4 group-hover:text-amber-100">
                Sources &amp; Artist Credits
              </span>
            </button>
          </div>

        </div>
      </footer>

      {/* Citadel Archival Sources & Artists Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="credits-modal-title"
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#0c0b10] border border-amber-900/60 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_20px_rgba(245,158,11,0.15)] p-6 sm:p-8 space-y-6 text-zinc-200 font-sans text-xs sm:text-sm custom-scrollbar"
          >
            {/* Ambient subtle fire background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-amber-500/10 to-transparent pointer-events-none rounded-tr-2xl" />

            {/* Header */}
            <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-950 to-red-950 border border-amber-500/50 flex items-center justify-center text-xl shadow-lg">
                  📜
                </div>
                <div>
                  <h2
                    id="credits-modal-title"
                    className="font-cinzel text-base sm:text-lg font-bold text-amber-200 tracking-wider"
                  >
                    Citadel Lore Sources &amp; Guild of Artists
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-cinzel">
                    Archival Attributions &amp; Creative Credits
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Section 1: Lore & Encyclopedic Archives */}
            <div className="space-y-2.5">
              <h3 className="font-cinzel font-bold text-amber-300 flex items-center gap-2 text-xs uppercase tracking-wider">
                <span>🏛️</span> Encyclopedic Archives &amp; Literature
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                <a
                  href="https://awoiaf.westeros.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-900 transition-all group block"
                >
                  <div className="flex items-center justify-between text-amber-200 font-cinzel font-semibold text-xs group-hover:text-amber-100">
                    <span>A Wiki of Ice and Fire</span>
                    <span className="text-[10px] text-zinc-500 group-hover:text-amber-400">↗</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Canonical chronicles, dragon dimensions, death accounts, and historical timeline records maintained by the Westeros.org community.
                  </p>
                </a>

                <a
                  href="https://gameofthrones.fandom.com/wiki/Dragons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-900 transition-all group block"
                >
                  <div className="flex items-center justify-between text-amber-200 font-cinzel font-semibold text-xs group-hover:text-amber-100">
                    <span>Game of Thrones Fandom Wiki</span>
                    <span className="text-[10px] text-zinc-500 group-hover:text-amber-400">↗</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Visual references, television adaptation lineages, and scale comparative records from HBO&apos;s adaptation series.
                  </p>
                </a>

              </div>
            </div>

            {/* Section 2: Guild of Illustrators & Visual Artists */}
            <div className="space-y-2.5">
              <h3 className="font-cinzel font-bold text-amber-300 flex items-center gap-2 text-xs uppercase tracking-wider">
                <span>🎨</span> Guild of Dragon Illustrators
              </h3>
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3.5 text-xs text-zinc-300 leading-relaxed space-y-2">
                <p>
                  The dragon silhouettes, portraits, and digital renderings showcased across this compendium were crafted by esteemed fantasy illustrators and passionate community artists:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-medium text-amber-100/90">
                  <span className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded-md border border-zinc-800">
                    <span>🖌️</span> Sam Hogg
                  </span>
                  <span className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded-md border border-zinc-800">
                    <span>🖌️</span> Douglas Wheatley
                  </span>
                  <span className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded-md border border-zinc-800">
                    <span>🖌️</span> Jordi González
                  </span>
                  <span className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded-md border border-zinc-800">
                    <span>🖌️</span> Rudolf Hima
                  </span>
                  <span className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded-md border border-zinc-800">
                    <span>🖌️</span> Marc Simonetti
                  </span>
                  <span className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded-md border border-zinc-800">
                    <span>🖌️</span> Community Artists
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Legal & Disclaimer */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-[11px] text-zinc-400 space-y-1.5 font-sans leading-relaxed">
              <div className="flex items-center gap-1.5 font-cinzel font-semibold text-amber-300/90">
                <span>🛡️</span> Non-Commercial Fan Project Disclaimer
              </div>
              <p>
                All dragon lore, names, and quotes are based on George R. R. Martin&apos;s works (<em>A Song of Ice and Fire</em>, <em>Fire &amp; Blood</em>, and <em>The World of Ice &amp; Fire</em>). Text excerpts are referenced under fair use and Creative Commons (CC-BY-SA 3.0). All visual artwork remains the intellectual property of their original creators and respective publishers.
              </p>
            </div>

            {/* Footer Close */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-xs font-cinzel text-zinc-300 hover:text-white border border-zinc-700 transition-colors cursor-pointer"
              >
                Close Archives ✕
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
