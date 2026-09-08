"use client";

import { useState, useRef, useEffect } from "react";

type DragonImageProps = {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  isBlendedImage?: boolean;
  priority?: boolean;
};

export default function DragonImage({
  src,
  alt,
  className = "",
  style = {},
  isBlendedImage = false,
  priority = false,
}: DragonImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Check if browser already loaded/cached the image
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }

    // Safety timeout: Ensure loading skeleton dissolves after 1.5s maximum
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [src]);

  return (
    <div className="relative flex items-center justify-center min-h-[140px] min-w-[140px]">
      {/* Skeleton Loading Placeholder - auto-dissolves */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/40 border border-amber-900/20 rounded-2xl animate-pulse backdrop-blur-xs z-10 pointer-events-none">
          <span className="text-2xl animate-bounce">🐉</span>
          <span className="text-[10px] font-cinzel text-amber-400/80 mt-1">
            {alt}
          </span>
        </div>
      )}

      {/* Fallback Display on Error */}
      {error ? (
        <div className="flex flex-col items-center justify-center p-4 bg-zinc-950 border border-amber-900/40 rounded-xl text-center space-y-1">
          <span className="text-3xl">🐉</span>
          <span className="font-cinzel text-xs font-bold text-amber-300">{alt}</span>
          <span className="text-[10px] text-zinc-500">Citadel Archive Portrait</span>
        </div>
      ) : (
        /* Actual Image - Always rendered, smooth opacity transition */
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`transition-opacity duration-300 ${
            isBlendedImage ? "dragon-image-blend" : ""
          } ${className}`}
          style={style}
        />
      )}
    </div>
  );
}
