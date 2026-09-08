import MapSection from "@/components/MapSection";
import dragons from "@/data/dragons.json";
import { Dragon } from "@/types/dragon";

export default function HomePage() {
  return (
    <main className="relative w-full">
      <MapSection dragons={dragons as Dragon[]} />
    </main>
  );
}

