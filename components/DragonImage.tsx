"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

type DragonImageProps = {
  src: string;
  alt: string;
  dragonId?: string;
  className?: string;
  style?: React.CSSProperties;
  isBlendedImage?: boolean;
  priority?: boolean;
};

export default function DragonImage({
  src,
  alt,
  dragonId,
  className = "",
  style = {},
  isBlendedImage = false,
  priority = false,
}: DragonImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [useDirect, setUseDirect] = useState(false);
  const [error, setError] = useState(false);

  // Use cleaned, pre-padded silhouette clipart if dragonId is provided
  const activeSrc = dragonId ? `/dragons/clean/${dragonId}.webp` : src;
  const isLocalClean = activeSrc.startsWith("/dragons/clean/");

  useEffect(() => {
    setLoaded(false);
    setUseDirect(false);
    setError(false);
  }, [activeSrc]);

  const handleImageError = () => {
    if (isLocalClean && !useDirect) {
      // Fallback to original remote src if clean local asset failed
      setUseDirect(true);
    } else {
      setError(true);
    }
  };

  const currentSrc = useDirect && isLocalClean ? src : activeSrc;

  return (
    <div className="relative flex items-center justify-center">
      {/* Skeleton Loading Placeholder without harsh box borders */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
          <span className="text-2xl animate-pulse">🐉</span>
        </div>
      )}

      {/* Fallback Display on Error */}
      {error ? (
        <div className="flex flex-col items-center justify-center p-4 bg-zinc-950/80 border border-amber-900/40 rounded-xl text-center space-y-1 z-10">
          <span className="text-3xl">🐉</span>
          <span className="font-cinzel text-xs font-bold text-amber-300">{alt}</span>
          <span className="text-[10px] text-zinc-500">Citadel Archive Portrait</span>
        </div>
      ) : (
        <Image
          src={currentSrc}
          alt={alt}
          width={450}
          height={320}
          quality={85}
          priority={priority}
          unoptimized={isLocalClean || useDirect}
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
