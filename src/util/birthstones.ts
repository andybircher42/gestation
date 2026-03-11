export interface Birthstone {
  name: string;
  color: string;
}

const BIRTHSTONES: Record<number, Birthstone> = {
  1: { name: "Garnet", color: "#d6216e" },
  2: { name: "Amethyst", color: "#7c3aed" },
  3: { name: "Aquamarine", color: "#0891b2" },
  4: { name: "Diamond", color: "#64748b" },
  5: { name: "Emerald", color: "#059669" },
  6: { name: "Alexandrite", color: "#4d23b5" },
  7: { name: "Ruby", color: "#dc2626" },
  8: { name: "Peridot", color: "#65a30d" },
  9: { name: "Sapphire", color: "#2563eb" },
  10: { name: "Opal", color: "#d97706" },
  11: { name: "Topaz", color: "#ea580c" },
  12: { name: "Tanzanite", color: "#7c3aed" },
};

export { BIRTHSTONES };

/**
 *
 */
export function getBirthstone(month: number): Birthstone {
  if (month < 1 || month > 12 || !Number.isInteger(month)) {
    return BIRTHSTONES[1];
  }
  return BIRTHSTONES[month];
}

/**
 *
 */
export function getBirthstoneForDate(isoDate: string): Birthstone {
  const month = new Date(isoDate).getUTCMonth() + 1;
  return getBirthstone(month);
}
