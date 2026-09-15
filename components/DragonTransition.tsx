"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import dragonsData from "@/data/dragons.json";
import { getDragonFaction, FactionInfo } from "@/data/factions";

export type DragonTransitionTarget = {
  id: string;
  name: string;
  rider?: string;
  image?: string;
  colors?: string;
  side?: string;
  description?: string;
};

type DragonTransitionContextType = {
  startTransition: (dragon: DragonTransitionTarget) => void;
  isTransitioning: boolean;
  activeDragon: DragonTransitionTarget | null;
};

const DragonTransitionContext = createContext<DragonTransitionContextType>({
  startTransition: () => {},
  isTransitioning: false,
  activeDragon: null,
});

export function useDragonTransition() {
  return useContext(DragonTransitionContext);
}

const LORE_PHASES = [
  { text: "Summoning ancient scrolls from the Citadel archives...", icon: "🔥" },
  { text: "Deciphering High Valyrian chronicle & bloodline...", icon: "📜" },
  { text: "Kindling dragonfire & unveiling beast...", icon: "⚔️" },
];

export function DragonTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const [activeDragon, setActiveDragon] = useState<DragonTransitionTarget | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isNavigatingRef = useRef(false);

  // Total duration of the transition in milliseconds (~3 seconds)
  const TRANSITION_DURATION = 3000;

  const finishTransition = useCallback(() => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsTransitioning(false);
      setIsFadingOut(false);
      setActiveDragon(null);
      setProgress(0);
      setPhaseIndex(0);
      setPreviewLoaded(false);
      isNavigatingRef.current = false;
    }, 450);
  }, []);

  const startTransition = useCallback(
    (dragon: DragonTransitionTarget) => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }

      setActiveDragon(dragon);
      setIsTransitioning(true);
      setIsFadingOut(false);
      setProgress(0);
      setPhaseIndex(0);
      setPreviewLoaded(false);
      isNavigatingRef.current = false;
      startTimeRef.current = performance.now();

      // 1. Eagerly preload destination dragon images into browser memory
      const cleanImg = new Image();
      cleanImg.src = `/dragons/clean/${dragon.id}.webp`;
      if (dragon.image) {
        const remoteImg = new Image();
        remoteImg.src = dragon.image;
      }

      // 2. Prefetch destination route via Next.js router
      router.prefetch(`/dragons/${dragon.id}`);

      // 3. Smooth requestAnimationFrame progress loop across 3.0 seconds
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current;
        const currentProgress = Math.min(100, (elapsed / TRANSITION_DURATION) * 100);
        setProgress(currentProgress);

        // Update lore phases sequentially
        if (elapsed < 1000) {
          setPhaseIndex(0);
        } else if (elapsed < 2000) {
          setPhaseIndex(1);
        } else {
          setPhaseIndex(2);
        }

        // Trigger page navigation near the end so the DOM is ready when progress finishes
        if (elapsed >= TRANSITION_DURATION - 350 && !isNavigatingRef.current) {
          isNavigatingRef.current = true;
          router.push(`/dragons/${dragon.id}`);
        }

        if (elapsed < TRANSITION_DURATION) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          setProgress(100);
          finishTransition();
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    },
    [finishTransition, router]
  );

  // Global click interceptor to catch any link to /dragons/[id]
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Ignore modified clicks (Ctrl, Cmd, Shift, right-click)
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      try {
        const url = new URL(href, window.location.origin);
        const match = url.pathname.match(/^\/dragons\/([^/?#]+)\/?$/);
        if (match) {
          const targetId = match[1];
          // If already on that specific dragon page, skip
          if (pathnameRef.current === `/dragons/${targetId}`) return;

          const dragon = (dragonsData as any[]).find((d) => String(d.id) === String(targetId));
          if (dragon) {
            e.preventDefault();
            e.stopPropagation();
            startTransition(dragon);
          }
        }
      } catch {
        // Fallback for non-standard href
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, [startTransition]);

  const faction: FactionInfo = activeDragon ? getDragonFaction(activeDragon.name) : ({} as FactionInfo);

  return (
    <DragonTransitionContext.Provider value={{ startTransition, isTransitioning, activeDragon }}>
      {children}

      {/* Cinematic Valyrian Loading Screen Overlay */}
      {isTransitioning && activeDragon && (
        <div
          role="status"
          aria-live="polite"
          aria-label={`Loading ${activeDragon.name} archives`}
          className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#07060a] select-none overflow-hidden transition-opacity duration-500 ease-out ${
            isFadingOut ? "opacity-0 pointer-events-none scale-102" : "opacity-100 scale-100"
          }`}
        >
          {/* Deep Molten Dragonfire Radial Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(217,119,6,0.18)_0%,rgba(185,28,28,0.12)_35%,rgba(7,6,10,0.98)_80%)] pointer-events-none" />

          {/* Drifting Valyrian Ash & Embers Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-pulse"
                style={{
                  width: `${(i % 3) + 2}px`,
                  height: `${(i % 3) + 2}px`,
                  backgroundColor: i % 2 === 0 ? "#f59e0b" : "#ef4444",
                  boxShadow: i % 2 === 0 ? "0 0 8px #f59e0b" : "0 0 8px #ef4444",
                  left: `${(i * 7 + 4) % 94}%`,
                  bottom: "-10px",
                  animation: `emberRise ${2.4 + (i % 4) * 0.5}s ease-in-out infinite`,
                  animationDelay: `${(i * 0.22).toFixed(2)}s`,
                  opacity: 0.75,
                }}
              />
            ))}
          </div>

          {/* Quick Skip Control in Upper Corner */}
          <button
            onClick={() => {
              if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
              router.push(`/dragons/${activeDragon.id}`);
              finishTransition();
            }}
            className="absolute top-5 right-5 text-[11px] font-cinzel text-zinc-500 hover:text-amber-300 px-3 py-1 rounded-full border border-zinc-800 hover:border-amber-500/40 bg-zinc-950/60 transition-colors z-20 cursor-pointer"
          >
            Skip →
          </button>

          {/* Main Atmospheric Centerpiece */}
          <div className="relative z-10 flex flex-col items-center max-w-lg px-6 text-center space-y-6">
            
            {/* Rotating Valyrian Astrolabe & Draconic Crest */}
            <div className="relative flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44 my-1">
              {/* Outer Golden Rune Ring (Clockwise) */}
              <div
                className="absolute inset-0 rounded-full border border-dashed border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                style={{ animation: "spin 22s linear infinite" }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[9px] text-amber-400">◆</div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-amber-400">◆</div>
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 text-[9px] text-amber-400">◆</div>
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 text-[9px] text-amber-400">◆</div>
              </div>

              {/* Middle Counter-Rotating Celestial Ring */}
              <div
                className="absolute inset-3 sm:inset-4 rounded-full border border-amber-600/30 border-t-amber-400/80 border-b-red-500/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                style={{ animation: "spinReverse 14s linear infinite" }}
              />

              {/* Inner Glowing Heat Core */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-b from-amber-950/90 via-zinc-950 to-red-950/90 border border-amber-500/60 shadow-[0_0_35px_rgba(245,158,11,0.4)] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-radial from-amber-500/25 to-transparent animate-pulse" />
                
                {/* Dragon Silhouette Clipart Preview - Clean and centered */}
                <img
                  src={`/dragons/clean/${activeDragon.id}.webp`}
                  alt={activeDragon.name}
                  onLoad={() => setPreviewLoaded(true)}
                  onError={() => setPreviewLoaded(false)}
                  className={`w-20 h-20 object-contain drop-shadow-[0_0_14px_rgba(251,191,36,0.95)] animate-pulse transition-opacity duration-300 ${
                    previewLoaded ? "opacity-100 scale-100" : "opacity-0 scale-75 absolute"
                  }`}
                />
                {!previewLoaded && (
                  <span className="text-4xl filter drop-shadow-[0_0_14px_rgba(245,158,11,0.9)] select-none animate-pulse">
                    🐉
                  </span>
                )}
              </div>
            </div>

            {/* Citadel Archive Registry Pill */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950/90 border border-amber-900/60 shadow-lg text-[10px] sm:text-xs font-cinzel font-semibold text-amber-300 tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>CITADEL LORE ARCHIVE • RECORD #{activeDragon.id}</span>
            </div>

            {/* Dragon Name in Majestic Golden Typography */}
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-5xl font-cinzel font-extrabold uppercase tracking-widest bg-gradient-to-r from-amber-100 via-amber-300 to-red-400 bg-clip-text text-transparent drop-shadow-[0_4px_25px_rgba(245,158,11,0.5)]">
                {activeDragon.name}
              </h2>

              {/* Rider & Allegiance Details */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-cinzel">
                {faction.name && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${faction.badgeClass}`}>
                    {faction.sigil} {faction.name}
                  </span>
                )}
                <span className="text-zinc-400 font-sans text-xs">
                  {activeDragon.rider ? `Rider: ${activeDragon.rider}` : "Wild & Unbound Beast"}
                </span>
              </div>
            </div>

            {/* Cycling Citadel Lore Feed */}
            <div className="h-6 flex items-center justify-center gap-2 text-xs text-amber-200/90 font-cinzel font-medium transition-all duration-300">
              <span className="text-sm animate-bounce">{LORE_PHASES[phaseIndex].icon}</span>
              <span className="tracking-wide">{LORE_PHASES[phaseIndex].text}</span>
            </div>

            {/* 3-Second Molten Dragonfire Progress Bar */}
            <div className="w-full max-w-xs sm:max-w-sm space-y-1.5 pt-1">
              <div className="relative w-full h-2.5 rounded-full bg-zinc-950 border border-amber-500/40 p-[1px] shadow-[0_0_16px_rgba(245,158,11,0.25)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 via-orange-400 to-red-500 shadow-[0_0_14px_rgba(245,158,11,0.9)] transition-[width] duration-75 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  {/* Molten flare pip on leading edge */}
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/90 rounded-full shadow-[0_0_8px_#ffffff]" />
                </div>
              </div>

              {/* Valyrian Seal Subtext & Percentage */}
              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-cinzel font-semibold px-1">
                <span className="tracking-widest text-amber-500/70">FIRE &amp; BLOOD • DRAKARI</span>
                <span className="font-mono text-amber-400 font-bold">{Math.round(progress)}%</span>
              </div>
            </div>

          </div>

          {/* Inline Keyframes for Particles and Counter-Rotation */}
          <style jsx>{`
            @keyframes emberRise {
              0% {
                transform: translateY(0) translateX(0) scale(0.8);
                opacity: 0;
              }
              20% {
                opacity: 0.9;
              }
              80% {
                opacity: 0.8;
                transform: translateY(-80vh) translateX(12px) scale(1.1);
              }
              100% {
                transform: translateY(-100vh) translateX(-8px) scale(0.5);
                opacity: 0;
              }
            }
            @keyframes spinReverse {
              from {
                transform: rotate(360deg);
              }
              to {
                transform: rotate(0deg);
              }
            }
          `}</style>
        </div>
      )}
    </DragonTransitionContext.Provider>
  );
}
