import { contrastText } from "./contrastText";

describe("contrastText", () => {
  it("returns white for dark backgrounds", () => {
    expect(contrastText("#000000")).toBe("#ffffff");
    expect(contrastText("#1565C0")).toBe("#ffffff"); // Sapphire
    expect(contrastText("#8B2252")).toBe("#ffffff"); // Scorpio
    expect(contrastText("#5A6E4E")).toBe("#ffffff"); // Capricorn
  });

  it("returns dark for light backgrounds", () => {
    expect(contrastText("#ffffff")).toBe("#1a1a1a");
    expect(contrastText("#F5F5F0")).toBe("#1a1a1a"); // Daisy
    expect(contrastText("#F8F0E8")).toBe("#1a1a1a"); // Lily
    expect(contrastText("#F5D547")).toBe("#1a1a1a"); // Daffodil
    expect(contrastText("#F0E060")).toBe("#1a1a1a"); // Narcissus
  });

  it("returns white for medium-dark colors", () => {
    expect(contrastText("#7B68AE")).toBe("#ffffff"); // Violet
    expect(contrastText("#C8465C")).toBe("#ffffff"); // Rose
    expect(contrastText("#D14B4B")).toBe("#ffffff"); // Aries
  });

  it("handles colors without hash", () => {
    expect(contrastText("000000")).toBe("#ffffff");
    expect(contrastText("ffffff")).toBe("#1a1a1a");
  });
});
