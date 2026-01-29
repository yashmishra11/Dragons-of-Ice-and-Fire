import Link from "next/link";

type Dragon = {
  id: string;
  name: string;
};

export default function DragonCard({ dragon }: { dragon: Dragon }) {
  return (
    <Link
      href={`/dragons/${dragon.id}`}
      className="rounded-lg bg-zinc-900 hover:bg-zinc-800 p-3 transition"
    >
      <h3 className="font-semibold">{dragon.name}</h3>
    </Link>
  );
}
