import { ImageSourcePropType } from "react-native";

import { Entry, SymbolType } from "@/storage";

import { getBirthFlower, getBirthFlowerImage } from "./birthFlowers";
import { getBirthstone, getBirthstoneImage } from "./birthstones";
import { getZodiacSign, getZodiacSignImage } from "./zodiacSigns";

export interface ResolvedSymbol {
  /** Display name (e.g., "Pearl", "Rose", "Leo"). */
  name: string;
  /** Hex color for backgrounds. */
  color: string;
  /** Image source for the icon. */
  image: ImageSourcePropType;
  /** The symbol type. */
  type: SymbolType;
  /** Human-readable label (e.g., "Birthstone", "Flower", "Zodiac"). */
  label: string;
}

/**
 * LRU cache for resolved symbols. Keyed by `${entry.id}:${entry.symbolType}`.
 * Avoids re-creating Date objects and re-resolving the same entry in tight
 * loops (CalendarMonth renders the same entries across many day cells).
 */
const cache = new Map<string, ResolvedSymbol>();
const MAX_CACHE = 200;

/** Resolves the display symbol (name, color, image, label) for an entry. */
export function resolveSymbol(entry: Entry): ResolvedSymbol {
  const key = `${entry.id}:${entry.symbolType ?? "gem"}`;
  const cached = cache.get(key);
  if (cached) {return cached;}

  const d = new Date(entry.dueDate + "T00:00:00");
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const type = entry.symbolType ?? "gem";

  let result: ResolvedSymbol;

  if (type === "zodiac") {
    const sign = entry.zodiacSign ?? getZodiacSign(month, day);
    result = {
      name: sign.name,
      color: sign.color,
      image: getZodiacSignImage(sign.name),
      type: "zodiac",
      label: "Zodiac",
    };
  } else if (type === "flower") {
    const flower = entry.birthFlower ?? getBirthFlower(month);
    result = {
      name: flower.name,
      color: flower.color,
      image: getBirthFlowerImage(flower.name),
      type: "flower",
      label: "Flower",
    };
  } else {
    const stone = entry.birthstone ?? getBirthstone(month);
    result = {
      name: stone.name,
      color: stone.color,
      image: getBirthstoneImage(stone.name),
      type: "gem",
      label: "Birthstone",
    };
  }

  // Evict oldest entries if cache is full
  if (cache.size >= MAX_CACHE) {
    const firstKey = cache.keys().next().value!;
    cache.delete(firstKey);
  }
  cache.set(key, result);

  return result;
}
