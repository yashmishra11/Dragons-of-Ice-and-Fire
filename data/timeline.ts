export type EraId = "all" | "valyria" | "conquest" | "dance" | "extinction" | "rebirth";

export type EraInfo = {
  id: EraId;
  title: string;
  years: string;
  icon: string;
  color: string;
  badgeClass: string;
  description: string;
  dragonNames: string[];
};

export const ERAS: Record<EraId, EraInfo> = {
  all: {
    id: "all",
    title: "All Historical Eras",
    years: "114 BC – 305 AC",
    icon: "📜",
    color: "amber",
    badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
    description: "Entire recorded history of Westeros & Valyrian dragons",
    dragonNames: [],
  },
  valyria: {
    id: "valyria",
    title: "Doom of Valyria",
    years: "Before 114 BC",
    icon: "🌋",
    color: "purple",
    badgeClass: "bg-purple-950/80 text-purple-300 border-purple-800/80",
    description: "The ancient Valyrian Freehold before the cataclysmic Doom",
    dragonNames: ["balerion", "cannibal"],
  },
  conquest: {
    id: "conquest",
    title: "Aegon's Conquest",
    years: "114 BC – 37 AC",
    icon: "👑",
    color: "amber",
    badgeClass: "bg-amber-950/80 text-amber-300 border-amber-800/80",
    description: "Aegon the Conqueror and his sisters unite the Seven Kingdoms",
    dragonNames: ["balerion", "vhagar", "meraxes", "quicksilver", "dreamfyre", "terrax"],
  },
  dance: {
    id: "dance",
    title: "Dance of the Dragons",
    years: "129 AC – 131 AC",
    icon: "⚔️",
    color: "red",
    badgeClass: "bg-red-950/80 text-red-300 border-red-800/80",
    description: "The disastrous Targaryen civil war between Queen Rhaenyra and King Aegon II",
    dragonNames: [
      "vhagar",
      "caraxes",
      "meleys",
      "arrax",
      "vermax",
      "tyraxes",
      "moondancer",
      "seasmoke",
      "sheepstealer",
      "sunfyre",
      "dreamfyre",
      "tessarion",
      "silverwing",
      "cannibal",
      "grey ghost",
      "morghul",
      "shrykos",
      "morning",
      "stormcloud",
      "vermithor",
    ],
  },
  extinction: {
    id: "extinction",
    title: "Dragonbane & Extinction",
    years: "153 AC – 298 AC",
    icon: "💀",
    color: "stone",
    badgeClass: "bg-stone-900 text-stone-300 border-stone-700",
    description: "The tragic decline and eventual extinction of Targaryen dragons in King's Landing",
    dragonNames: ["the last dragon", "morning"],
  },
  rebirth: {
    id: "rebirth",
    title: "Rebirth of Dragons",
    years: "299 AC – Present",
    icon: "🔥",
    color: "orange",
    badgeClass: "bg-orange-950/80 text-orange-300 border-orange-800/80",
    description: "Daenerys Targaryen hatches three dragon eggs in Khal Drogo's funeral pyre",
    dragonNames: ["drogon", "rhaegal", "viserion"],
  },
};

export function isDragonInEra(dragonName: string, eraId: EraId): boolean {
  if (eraId === "all") return true;

  const era = ERAS[eraId];
  if (!era) return true;

  const normalized = dragonName.toLowerCase().trim();
  return era.dragonNames.some((name) => normalized.includes(name) || name.includes(normalized));
}
