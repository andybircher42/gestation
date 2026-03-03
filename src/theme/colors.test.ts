import {
  darkColors,
  darkRowColors,
  lightColors,
  lightRowColors,
} from "./colors";

describe("color palettes", () => {
  it("light and dark palettes have the same keys", () => {
    const lightKeys = Object.keys(lightColors).sort();
    const darkKeys = Object.keys(darkColors).sort();
    expect(lightKeys).toEqual(darkKeys);
  });

  it("lightRowColors has 7 entries", () => {
    expect(lightRowColors).toHaveLength(7);
  });

  it("darkRowColors has 7 entries", () => {
    expect(darkRowColors).toHaveLength(7);
  });

  it("row color arrays have the same length", () => {
    expect(lightRowColors.length).toBe(darkRowColors.length);
  });
});
