"use client";

import { useState } from "react";

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
  priority = false,
}: DragonImageProps) {
  // Use cleaned, pre-padded silhouette clipart if dragonId is provided
  const activeSrc = dragonId ? `/dragons/clean/${dragonId}.webp` : src;
  const isLocalClean = activeSrc.startsWith("/dragons/clean/");

  const [prevSrc, setPrevSrc] = useState(activeSrc);
  const [useDirect, setUseDirect] = useState(false);
  const [error, setError] = useState(false);

  if (prevSrc !== activeSrc) {
    setPrevSrc(activeSrc);
    setUseDirect(false);
    setError(false);
  }

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
      {/* Fallback Display on Error */}
      {error ? (
        <div className="flex flex-col items-center justify-center p-4 bg-zinc-950/80 border border-amber-900/40 rounded-xl text-center space-y-1 z-10">
          <span className="text-3xl">🐉</span>
          <span className="font-cinzel text-xs font-bold text-amber-300">{alt}</span>
          <span className="text-[10px] text-zinc-500">Citadel Archive Portrait</span>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={handleImageError}
          className={`dragon-clipart ${className}`}
          style={style}
        />
      )}
    </div>
  );
}
