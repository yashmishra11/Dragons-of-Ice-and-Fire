import Image from "next/image";
import Link from "next/link";
import { Dragon } from "@/types/dragon";

export default function MapSection({ dragons }: { dragons: Dragon[] }) {
  return (
    <section 
      className="relative w-full overflow-hidden" 
      style={{ aspectRatio: "1272 / 4000" }}
    >
      <Image
        src="/map/bg.jpeg"
        fill
        className="object-contain"
        alt=""
      />
      <div className="absolute inset-0 backdrop-blur-[10px] bg-black/10 pointer-events-none" />
      {dragons.map((dragon) => (
        <Link
          key={dragon.id}
          href={`/dragons/${dragon.id}`}
          className="absolute"
          style={{
            top: dragon.top,
            left: dragon.side === "left" ? "4%" : "92%",
            transform:
              dragon.side === "left" ? "translateX(0)" : "translateX(-100%)",
          }}
        >
          {/* Fixed hitbox */}
          <div className="flex flex-col items-center pointer-events-auto">
            {/* VISUAL ONLY (scaled safely) */}
            <img
              src={dragon.image}
              alt={dragon.name}
              className="h-[300px] w-auto object-contain drop-shadow-lg transition-transform"
              style={{
                transform: `scale(${(dragon as any).scale ?? 1})`,
                transformOrigin: "center center",
                pointerEvents: "none",
              }}
            />
            {/* Label */}
            <span
              className="
                mt-1 text-xs text-white
                bg-black/60 backdrop-blur
                px-2 py-0.5 rounded
                whitespace-nowrap
              "
            >
              {dragon.name}
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}