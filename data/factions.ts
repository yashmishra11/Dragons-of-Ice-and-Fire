export type FactionId = "all" | "blacks" | "greens" | "wild" | "conquest" | "rebirth";

export type FactionInfo = {
  id: FactionId;
  name: string;
  sigil: string;
  colorClass: string;
  badgeClass: string;
  borderClass: string;
  description: string;
};

export const FACTIONS: Record<FactionId, FactionInfo> = {
  all: {
    id: "all",
    name: "All Dragons",
    sigil: "🐉",
    colorClass: "bg-amber-500 text-black font-bold",
    badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
    borderClass: "border-amber-500/40",
    description: "Complete Westeros & Valyrian dragon compendium",
  },
  blacks: {
    id: "blacks",
    name: "The Blacks",
    sigil: "🖤",
    colorClass: "bg-red-950 text-red-200 border-red-800 font-bold",
    badgeClass: "bg-red-950/80 text-red-300 border-red-800/80",
    borderClass: "border-red-700/50",
    description: "Queen Rhaenyra Targaryen's faction in the Dance of the Dragons",
  },
  greens: {
    id: "greens",
    name: "The Greens",
    sigil: "💚",
    colorClass: "bg-emerald-950 text-emerald-200 border-emerald-800 font-bold",
    badgeClass: "bg-emerald-950/80 text-emerald-300 border-emerald-800/80",
    borderClass: "border-emerald-700/50",
    description: "King Aegon II Targaryen's faction at King's Landing",
  },
  wild: {
    id: "wild",
    name: "Wild Dragons",
    sigil: "🌋",
    colorClass: "bg-stone-900 text-stone-200 border-stone-700 font-bold",
    badgeClass: "bg-stone-900/90 text-stone-300 border-stone-700",
    borderClass: "border-stone-600/50",
    description: "Untamed wild beasts dwelling on Dragonstone",
  },
  conquest: {
    id: "conquest",
    name: "Conquest & Old Royalty",
    sigil: "👑",
    colorClass: "bg-amber-950 text-amber-200 border-amber-800 font-bold",
    badgeClass: "bg-amber-950/80 text-amber-300 border-amber-800/80",
    borderClass: "border-amber-600/50",
    description: "Legendary beasts of Aegon's Conquest & early Targaryen Kings",
  },
  rebirth: {
    id: "rebirth",
    name: "Rebirth Era",
    sigil: "🔥",
    colorClass: "bg-orange-950 text-orange-200 border-orange-800 font-bold",
    badgeClass: "bg-orange-950/80 text-orange-300 border-orange-800/80",
    borderClass: "border-orange-600/50",
    description: "Born in the flames to Daenerys Targaryen in the Dothraki Sea",
  },
};

const BLACKS_DRAGONS = new Set([
  "arrax",
  "caraxes",
  "meleys",
  "moondancer",
  "seasmoke",
  "sheepstealer",
  "syrax",
  "tyraxes",
  "vermax",
]);

const GREENS_DRAGONS = new Set([
  "vhagar",
  "sunfyre",
  "dreamfyre",
  "tessarion",
  "morghul",
  "shrykos",
]);

const WILD_DRAGONS = new Set([
  "cannibal",
  "grey ghost",
  "sheepstealer",
]);

const CONQUEST_DRAGONS = new Set([
  "balerion",
  "meraxes",
  "vhagar",
  "quicksilver",
  "vermithor",
  "silverwing",
  "terrax",
]);

const REBIRTH_DRAGONS = new Set([
  "drogon",
  "rhaegal",
  "viserion",
]);

export function getDragonFaction(name: string): FactionInfo {
  const normalized = name.toLowerCase().trim();

  if (BLACKS_DRAGONS.has(normalized)) return FACTIONS.blacks;
  if (GREENS_DRAGONS.has(normalized)) return FACTIONS.greens;
  if (WILD_DRAGONS.has(normalized)) return FACTIONS.wild;
  if (REBIRTH_DRAGONS.has(normalized)) return FACTIONS.rebirth;
  if (CONQUEST_DRAGONS.has(normalized)) return FACTIONS.conquest;

  return FACTIONS.all;
}
