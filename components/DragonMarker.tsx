import Link from "next/link";
import { Dragon } from "@/types/dragon";

export default function DragonMarker({ dragon }: { dragon: Dragon }) {
  return (
    <Link
      href={`/dragons/${dragon.id}`}
      className={`
        absolute
        ${dragon.side === "left" ? "left-6" : "right-6"}
        rounded-xl bg-black/70 backdrop-blur
        px-4 py-2 text-white
        hover:bg-black transition
      `}
      style={{ top: dragon.top }}
    >
      {dragon.name}
    </Link>
  );
}
