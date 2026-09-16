"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export default function SmoothScroll() {
  const pathname = usePathname();
  const isDragonPage = pathname.startsWith("/dragons/");

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentRegion, setCurrentRegion] = useState("Beyond the Wall");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis with luxurious cinematic momentum easing
    const lenis = new Lenis({
      duration: 1.35, // Smooth, expensive glide
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration curve
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Attach RAF loop
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Scroll listener for progress and regional milestone awareness
    const onScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? Math.min(100, Math.max(0, (scrollY / totalHeight) * 100)) : 0;
      
      setScrollProgress(progress);
      setShowScrollTop(scrollY > 450);

      // Determine regional kingdom based on scroll depth
      if (progress < 16) {
        setCurrentRegion("❄️ Beyond the Wall");
      } else if (progress < 36) {
        setCurrentRegion("🐺 The North & Winterfell");
      } else if (progress < 56) {
        setCurrentRegion("🏰 The Riverlands & Vale");
      } else if (progress < 76) {
        setCurrentRegion("👑 Crownlands & King's Landing");
      } else if (progress < 88) {
        setCurrentRegion("🌹 The Reach & Stormlands");
      } else {
        setCurrentRegion("☀️ Dorne & The Red Mountains");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const scrollToTop = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.6 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Delicate Golden Dragonfire Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2.5px] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-red-500 shadow-[0_0_12px_rgba(245,158,11,0.85)] transition-[width] duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Westeros Cartographic Region Indicator & Back to Top Seal */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 pointer-events-none select-none">
        {/* Region Milestone Indicator - Shown only outside dragon info pages */}
        {!isDragonPage && (
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/90 border border-amber-900/50 backdrop-blur-md shadow-2xl transition-all duration-300 pointer-events-auto text-[11px] font-cinzel font-semibold text-amber-200/90 ${
              showScrollTop ? "opacity-90 hover:opacity-100" : "opacity-0 translate-y-2 pointer-events-none"
            }`}
          >
            <span className="text-xs">🧭</span>
            <span>{currentRegion}</span>
            <span className="text-[10px] text-amber-500/70 font-mono font-bold ml-1">
              {Math.round(scrollProgress)}%
            </span>
          </div>
        )}

        {/* Royal Targaryen Ascend Seal (Scroll to North / Top) */}
        <button
          onClick={scrollToTop}
          aria-label={isDragonPage ? "Ascend back to top of dragon lore" : "Ascend back to The Wall"}
          title={isDragonPage ? "Ascend back to top of dragon lore" : "Ascend back to The Wall & Beyond"}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-950/90 via-zinc-950/95 to-red-950/90 border border-amber-500/40 hover:border-amber-400 text-amber-200 hover:text-amber-100 text-xs font-cinzel font-bold shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all duration-300 pointer-events-auto cursor-pointer hover:scale-105 active:scale-95 ${
            showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <span className="text-sm animate-pulse">🐉</span>
          <span>{isDragonPage ? "↑ Back to Top" : "↑ The Wall"}</span>
        </button>
      </div>
    </>
  );
}
