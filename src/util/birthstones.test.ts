import {
  getBirthstone,
  getBirthstoneForDate,
  getBirthstoneImage,
} from "./birthstones";

describe("getBirthstone", () => {
  it("returns Garnet for January (1)", () => {
    expect(getBirthstone(1)).toEqual({ name: "Garnet", color: "#D81B7A" });
  });

  it("returns Turquoise for December (12)", () => {
    expect(getBirthstone(12)).toEqual({ name: "Turquoise", color: "#1E88E5" });
  });

  it("returns Emerald for May (5)", () => {
    expect(getBirthstone(5)).toEqual({ name: "Emerald", color: "#3A9A6A" });
  });

  it("falls back to Garnet for month 0", () => {
    expect(getBirthstone(0).name).toBe("Garnet");
  });

  it("falls back to Garnet for month 13", () => {
    expect(getBirthstone(13).name).toBe("Garnet");
  });

  it("falls back to Garnet for non-integer", () => {
    expect(getBirthstone(1.5).name).toBe("Garnet");
  });
});

describe("getBirthstoneForDate", () => {
  it("returns Garnet for a January date", () => {
    expect(getBirthstoneForDate("2026-01-15")).toEqual({
      name: "Garnet",
      color: "#D81B7A",
    });
  });

  it("returns Ruby for a July date", () => {
    expect(getBirthstoneForDate("2026-07-04")).toEqual({
      name: "Ruby",
      color: "#E53935",
    });
  });

  it("returns Turquoise for a December date", () => {
    expect(getBirthstoneForDate("2026-12-25")).toEqual({
      name: "Turquoise",
      color: "#1E88E5",
    });
  });
});

describe("getBirthstoneImage", () => {
  it("returns an image for a known birthstone name", () => {
    const image = getBirthstoneImage("Garnet");
    expect(image).toBeDefined();
  });

  it("falls back to Garnet image for unknown name", () => {
    const fallback = getBirthstoneImage("NonExistent");
    const garnet = getBirthstoneImage("Garnet");
    expect(fallback).toBe(garnet);
  });
});
