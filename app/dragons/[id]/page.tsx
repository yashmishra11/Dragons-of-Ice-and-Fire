import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import dragons from "@/data/dragons.json";
import { Dragon } from "@/types/dragon";
import HistoryToggle from "@/components/HistoryToggle";
import SubmitDragonChange from "@/components/SubmitDragonChange";
import DragonImage from "@/components/DragonImage";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateStaticParams() {
  return (dragons as Dragon[]).map((d) => ({
    id: d.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const dragon = (dragons as Dragon[]).find((d) => d.id === id);
  if (!dragon) {
    return {
      title: "Dragon Lore Archive | Dragons of Ice & Fire",
    };
  }

  const aliasOrRider = dragon.alias || dragon.rider || "Legendary Dragon of Westeros";
  const desc = `${dragon.name} (${aliasOrRider}) — Citadel archival record, rider lineage, scale coloration, and historical chronicles.`;

  return {
    title: `${dragon.name} — Lore & Chronicle | Dragons of Ice & Fire`,
    description: desc,
    openGraph: {
      title: `${dragon.name} — Dragons of Ice & Fire`,
      description: desc,
      images: [
        {
          url: `/dragons/clean/${dragon.id}.webp`,
          width: 800,
          height: 600,
          alt: `${dragon.name} silhouette`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${dragon.name} — Dragons of Ice & Fire`,
      description: desc,
      images: [`/dragons/clean/${dragon.id}.webp`],
    },
  };
}

export default async function DragonPage({ params }: PageProps) {
  const { id } = await params;

  const dragonList = dragons as Dragon[];
  const currentIndex = dragonList.findIndex((d) => d.id === id);

  if (currentIndex === -1) {
    notFound();
  }

  const dragon = dragonList[currentIndex];
  const prevDragon = dragonList[currentIndex - 1] || dragonList[dragonList.length - 1];
  const nextDragon = dragonList[currentIndex + 1] || dragonList[0];

  const isAlive = Boolean(dragon.died && dragon.died.toLowerCase().includes("alive"));

  const isBlendedImage =
    dragon.name.toLowerCase() === "cannibal" ||
    dragon.image.toLowerCase().includes("cannibal") ||
    dragon.image.toLowerCase().includes("greyghost");

  return (
    <main className="min-h-screen bg-[#08070b] text-white px-4 sm:px-8 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-300 font-medium transition-colors group px-3 py-1.5 rounded-full bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to Interactive Map
          </Link>

          <div className="flex items-center gap-2 text-xs">
            <Link
              href={`/dragons/${prevDragon.id}`}
              className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white transition-colors"
            >
              ← {prevDragon.name}
            </Link>
            <Link
              href={`/dragons/${nextDragon.id}`}
              className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white transition-colors"
            >
              {nextDragon.name} →
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Dragon Image Card (5 Cols) */}
          <div className="lg:col-span-5 relative w-full aspect-square bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-amber-900/30 rounded-2xl p-6 overflow-hidden shadow-2xl flex flex-col items-center justify-center fire-glow">
            <div className="absolute inset-0 bg-radial from-amber-500/5 to-transparent pointer-events-none" />
            
            {dragon.image ? (
              <DragonImage
                dragonId={dragon.id}
                src={dragon.image}
                alt={dragon.name}
                priority
                isBlendedImage={isBlendedImage}
                className={`max-h-[380px] w-auto object-contain transition-transform duration-500 hover:scale-105 ${
                  !isBlendedImage ? "filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]" : ""
                }`}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-500 font-cinzel">
                <span className="text-4xl">🐉</span>
                No portrait recorded in Citadel archives
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1.5 bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-xl border border-zinc-800/90 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-cinzel">Vault Registry ID</span>
                <span className="text-xs font-mono font-bold text-amber-400">#{dragon.id}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-zinc-800/70 text-[10px]">
                <span className="text-zinc-500 font-cinzel flex items-center gap-1">
                  <span>🎨</span> Illustration
                </span>
                <a
                  href="https://awoiaf.westeros.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400/80 hover:text-amber-300 font-cinzel font-medium flex items-center gap-0.5 transition-colors"
                >
                  <span>Citadel Archive</span>
                  <span className="text-[9px]">↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT: Lore & Specifications (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 bg-zinc-950/50 border border-zinc-900 p-6 sm:p-8 rounded-2xl backdrop-blur-md">
            
            {/* Header Title & Status */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-4">
              <div>
                <h1 className="text-3xl sm:text-5xl font-cinzel font-bold tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-red-400 bg-clip-text text-transparent">
                  {dragon.name}
                </h1>
                <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest font-cinzel">
                  {dragon.side === "left" ? "Eastern Dragonmont Lineage" : "Western Westeros Legend"}
                </p>
              </div>

              {isAlive ? (
                <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active / Alive
                </span>
              ) : (
                <span className="bg-zinc-900 text-zinc-400 border border-zinc-800 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                  Deceased / Historic
                </span>
              )}
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoCard icon="👑" label="Rider" value={dragon.rider} />
              <InfoCard icon="🎨" label="Scales & Flame" value={dragon.colors} />
              <InfoCard icon="🥚" label="Hatched" value={dragon.hatched} />
              <InfoCard icon="⚔️" label="Died / Status" value={dragon.died} />
            </div>

            {/* Description */}
            <section className="space-y-2 pt-2">
              <h2 className="text-base font-cinzel font-bold text-amber-300 flex items-center gap-2">
                <span>📜</span> Description & Physicality
              </h2>
              <p className="text-zinc-300 text-sm leading-relaxed bg-zinc-900/40 p-4 rounded-xl border border-zinc-900">
                {dragon.description}
              </p>
            </section>

            {/* History Chronicle */}
            <section className="space-y-2 pt-2">
              <h2 className="text-base font-cinzel font-bold text-amber-300 flex items-center gap-2">
                <span>📚</span> Historical Chronicle
              </h2>
              <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-900 space-y-2">
                <HistoryToggle text={dragon.history || "No historical chronicle exists for this dragon."} />
                <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-1 text-[11px] text-zinc-500 font-cinzel">
                  <span className="italic flex items-center gap-1.5">
                    <span>📜</span> Chronicle sourced from Citadel archives via{" "}
                    <a
                      href="https://awoiaf.westeros.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400/70 hover:text-amber-300 underline underline-offset-2 transition-colors"
                    >
                      A Wiki of Ice and Fire
                    </a>
                  </span>
                  <span className="text-[10px] text-zinc-600 font-mono">CC-BY-SA 3.0</span>
                </div>
              </div>
            </section>

            {/* Submit Correction Component */}
            <div className="pt-4 border-t border-zinc-900">
              <SubmitDragonChange dragon={dragon} />
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}

function InfoCard({ icon, label, value }: { icon: string; label: string; value: string | undefined }) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
      <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
        <span>{icon}</span>
        <span className="font-cinzel text-[11px] font-medium">{label}</span>
      </div>
      <p className="text-xs font-medium text-zinc-200 line-clamp-2" title={value || "Unknown"}>
        {value || "Unknown"}
      </p>
    </div>
  );
}
