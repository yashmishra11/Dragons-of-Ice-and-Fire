import MapSection from "@/components/MapSection";
import dragons from "@/data/dragons.json";

export default function HomePage() {
  return (
    <main className="relative w-full">
         <MapSection dragons={dragons} />
    </main>
  );
}
