import dragons from "@/data/dragons.json";

export default function DragonLayer() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {dragons.map((dragon) => (
        <div
          key={dragon.id}
          className={`absolute ${
            dragon.side === "left" ? "left-6" : "right-6"
          }`}
          style={{ top: dragon.top }}
        >
          <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">
            {dragon.name}
          </span>
        </div>
      ))}
    </div>
  );
}
