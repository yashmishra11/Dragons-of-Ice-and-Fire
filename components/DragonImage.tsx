"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

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
  const [useDirect, setUseDirect] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset loading state when src changes
    setLoaded(false);
    setUseDirect(false);
    setError(false);
  }, [src]);

  const handleImageError = () => {
    if (!useDirect) {
      // Next.js image optimizer server proxy failed (e.g. ImgBB rate limit/403)
      // Fallback to direct client-side loading
      setUseDirect(true);
    } else {
      // Direct load also failed -> show archive placeholder
      setError(true);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-[140px] min-w-[140px]">
      {/* Skeleton Loading Placeholder */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/50 border border-amber-900/30 rounded-2xl animate-pulse backdrop-blur-xs z-10 pointer-events-none">
          <span className="text-2xl animate-bounce">🐉</span>
          <span className="text-[10px] font-cinzel text-amber-400/80 mt-1 font-bold">
            {alt}
          </span>
        </div>
      )}

      {/* Fallback Display on Error */}
      {error ? (
        <div className="flex flex-col items-center justify-center p-4 bg-zinc-950 border border-amber-900/40 rounded-xl text-center space-y-1 z-10">
          <span className="text-3xl">🐉</span>
          <span className="font-cinzel text-xs font-bold text-amber-300">{alt}</span>
          <span className="text-[10px] text-zinc-500">Citadel Archive Portrait</span>
        </div>
      ) : (
        /* Next.js Image Component with Automatic Direct Fallback for Remote Hosts */
        <Image
          src={src}
          alt={alt}
          width={450}
          height={320}
          quality={92}
          priority={priority}
          unoptimized={useDirect}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          onLoad={() => setLoaded(true)}
          onError={handleImageError}
          className={`transition-all duration-300 ${
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
          } ${isBlendedImage ? "dragon-image-blend" : ""} ${className}`}
          style={style}
        />
      )}
    </div>
  );
}
