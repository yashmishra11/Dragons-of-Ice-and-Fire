import Image from "next/image";
import { notFound } from "next/navigation";
import dragons from "@/data/dragons.json";
import { Dragon } from "@/types/dragon";
import HistoryToggle from "@/components/HistoryToggle";
import SubmitDragonChange from "@/components/SubmitDragonChange";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DragonPage({ params }: PageProps) {
  const { id } = await params;

  const dragon = (dragons as Dragon[]).find(
    (d) => d.id === id
  );

  if (!dragon) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* LEFT: Image */}
        <div className="relative w-full aspect-square bg-zinc-900 rounded-xl overflow-hidden">
          {dragon.image ? (
            <Image
              src={dragon.image}
              alt={dragon.name}
              fill
              className="object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500">
              No image available
            </div>
          )}
        </div>

        {/* RIGHT: Info */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">{dragon.name}</h1>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="Rider" value={dragon.rider} />
            <Info label="Colors" value={dragon.colors} />
            <Info label="Hatched" value={dragon.hatched} />
            <Info label="Died" value={dragon.died} />
          </div>

          <section>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-zinc-300 leading-relaxed">
              {dragon.description}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">History</h2>
            <HistoryToggle text={dragon.history || "Unknown"} />
            <SubmitDragonChange dragon={dragon} />

          </section>
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="bg-zinc-900 rounded-lg p-3">
      <p className="text-zinc-400 text-xs">{label}</p>
      <p className="font-medium">{value || "Unknown"}</p>
    </div>
  );
}
