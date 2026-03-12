import {
  calendarHeatMap,
  colorForLoad,
  conditionalProbability,
  deliveryLoadForDate,
  erf,
  gestationalDayForDate,
  inductionAdjustedPDF,
  normalCDF,
  normalPDF,
  truncatedNormalPDF,
} from "./probabilityEngine";

describe("erf", () => {
  it("returns 0 for x=0", () => {
    expect(erf(0)).toBeCloseTo(0, 7);
  });

  it("returns ~0.8427 for x=1", () => {
    expect(erf(1)).toBeCloseTo(0.8427, 3);
  });

  it("is odd (erf(-x) = -erf(x))", () => {
    expect(erf(-1)).toBeCloseTo(-erf(1), 6);
  });
});

describe("normalCDF", () => {
  it("returns 0.5 at the mean", () => {
    expect(normalCDF(280, 280, 10)).toBeCloseTo(0.5, 6);
  });

  it("returns ~0.8413 at mu+sigma", () => {
    expect(normalCDF(290, 280, 10)).toBeCloseTo(0.8413, 3);
  });
});

describe("normalPDF", () => {
  it("peaks at the mean", () => {
    const atMean = normalPDF(280, 280, 10);
    const offset = normalPDF(285, 280, 10);
    expect(atMean).toBeGreaterThan(offset);
  });

  it("is symmetric", () => {
    expect(normalPDF(275, 280, 10)).toBeCloseTo(normalPDF(285, 280, 10), 10);
  });
});

describe("truncatedNormalPDF", () => {
  it("returns 0 outside support", () => {
    expect(truncatedNormalPDF(139, 280, 10, 140, 301)).toBe(0);
    expect(truncatedNormalPDF(302, 280, 10, 140, 301)).toBe(0);
  });

  it("returns positive values inside support", () => {
    expect(truncatedNormalPDF(280, 280, 10, 140, 301)).toBeGreaterThan(0);
  });

  it("integrates to approximately 1 over support", () => {
    let sum = 0;
    for (let d = 140; d <= 301; d++) {
      sum += truncatedNormalPDF(d, 280, 10, 140, 301);
    }
    expect(sum).toBeCloseTo(1, 1);
  });
});

describe("inductionAdjustedPDF", () => {
  it("returns 0 after induction day", () => {
    expect(inductionAdjustedPDF(288, 280, 10, 140, 301, 287)).toBe(0);
  });

  it("concentrates tail mass on induction day", () => {
    const atInduction = inductionAdjustedPDF(287, 280, 10, 140, 301, 287);
    const beforeInduction = inductionAdjustedPDF(286, 280, 10, 140, 301, 287);
    // Induction day should have MORE mass than adjacent day due to tail concentration
    expect(atInduction).toBeGreaterThan(beforeInduction);
  });
});

describe("conditionalProbability", () => {
  it("returns 0 for past days", () => {
    expect(conditionalProbability(270, 275, 280, 10, 140, 301, 287)).toBe(0);
  });

  it("returns 0 after induction day", () => {
    expect(conditionalProbability(290, 270, 280, 10, 140, 301, 287)).toBe(0);
  });

  it("returns positive for future days in range", () => {
    expect(
      conditionalProbability(280, 270, 280, 10, 140, 301, 287),
    ).toBeGreaterThan(0);
  });
});

describe("gestationalDayForDate", () => {
  it("returns 280 on the due date itself", () => {
    expect(gestationalDayForDate("2026-06-15", "2026-06-15")).toBe(280);
  });

  it("returns 275 when 5 days before due date", () => {
    expect(gestationalDayForDate("2026-06-15", "2026-06-10")).toBe(275);
  });

  it("returns 285 when 5 days after due date", () => {
    expect(gestationalDayForDate("2026-06-15", "2026-06-20")).toBe(285);
  });
});

describe("deliveryLoadForDate", () => {
  it("returns 0 for no entries", () => {
    expect(deliveryLoadForDate([], "2026-06-15", "2026-03-01")).toBe(0);
  });

  it("returns positive for entries near due date", () => {
    const entries = [{ id: "1", name: "A", dueDate: "2026-06-15" }];
    // ~2 weeks before due date, checking the due date itself
    const load = deliveryLoadForDate(entries, "2026-06-15", "2026-06-01");
    expect(load).toBeGreaterThan(0);
  });

  it("aggregates across multiple entries", () => {
    const one = [{ id: "1", name: "A", dueDate: "2026-06-15" }];
    const two = [
      { id: "1", name: "A", dueDate: "2026-06-15" },
      { id: "2", name: "B", dueDate: "2026-06-15" },
    ];
    const loadOne = deliveryLoadForDate(one, "2026-06-15", "2026-06-01");
    const loadTwo = deliveryLoadForDate(two, "2026-06-15", "2026-06-01");
    expect(loadTwo).toBeGreaterThan(loadOne);
  });
});

describe("colorForLoad", () => {
  it("returns transparent for low load", () => {
    expect(colorForLoad(0)).toBe("transparent");
    expect(colorForLoad(0.004)).toBe("transparent");
  });

  it("returns rgba for load above threshold", () => {
    const color = colorForLoad(0.05);
    expect(color).toMatch(/^rgba\(57,27,89,/);
  });

  it("caps at max opacity", () => {
    const color = colorForLoad(1.0);
    expect(color).toBe("rgba(57,27,89,0.400)");
  });
});

describe("calendarHeatMap", () => {
  it("returns one entry per day in range", () => {
    const result = calendarHeatMap(
      [],
      "2026-06-01",
      "2026-06-30",
      "2026-06-01",
    );
    expect(result).toHaveLength(30);
    expect(result[0].date).toBe("2026-06-01");
    expect(result[29].date).toBe("2026-06-30");
  });

  it("includes load and color for each day", () => {
    const entries = [{ id: "1", name: "A", dueDate: "2026-06-15" }];
    const result = calendarHeatMap(
      entries,
      "2026-06-10",
      "2026-06-20",
      "2026-06-01",
    );
    // Due date (June 15) should have some load
    const dueDateEntry = result.find((e) => e.date === "2026-06-15");
    expect(dueDateEntry).toBeDefined();
    expect(dueDateEntry!.load).toBeGreaterThan(0);
  });
});
