import {
  darkColors,
  darkRowColors,
  lightColors,
  lightRowColors,
  monoColors,
  monoRowColors,
  palettes,
  Personality,
} from "./colors";

describe("color palettes", () => {
  it("all legacy palettes have the same keys", () => {
    const lightKeys = Object.keys(lightColors).sort();
    const darkKeys = Object.keys(darkColors).sort();
    const monoKeys = Object.keys(monoColors).sort();
    expect(lightKeys).toEqual(darkKeys);
    expect(lightKeys).toEqual(monoKeys);
  });

  it("lightRowColors has 7 entries", () => {
    expect(lightRowColors).toHaveLength(7);
  });

  it("darkRowColors has 7 entries", () => {
    expect(darkRowColors).toHaveLength(7);
  });

  it("monoRowColors has 4 entries", () => {
    expect(monoRowColors).toHaveLength(4);
  });

  it("light and dark row color arrays have the same length", () => {
    expect(lightRowColors.length).toBe(darkRowColors.length);
  });

  it("every personality has consistent color token keys across light and dark", () => {
    const referenceKeys = Object.keys(palettes.classic.light.colors).sort();
    const personalities: Personality[] = [
      "classic",
      "warm",
      "elegant",
      "playful",
      "modern",
      "mono",
    ];

    for (const p of personalities) {
      const lightKeys = Object.keys(palettes[p].light.colors).sort();
      const darkKeys = Object.keys(palettes[p].dark.colors).sort();
      expect(lightKeys).toEqual(referenceKeys);
      expect(darkKeys).toEqual(referenceKeys);
    }
  });

  it("every personality has at least 4 row colors per variant", () => {
    const personalities: Personality[] = [
      "classic",
      "warm",
      "elegant",
      "playful",
      "modern",
      "mono",
    ];

    for (const p of personalities) {
      expect(palettes[p].light.rowColors.length).toBeGreaterThanOrEqual(4);
      expect(palettes[p].dark.rowColors.length).toBeGreaterThanOrEqual(4);
    }
  });
});
