import { parseBatchEntry, parseBatchInput } from "./batchParse";

// Fixed "now" for deterministic tests: March 2, 2026
const now = new Date(2026, 2, 2);

describe("parseBatchEntry", () => {
  describe("gestational age formats", () => {
    it("parses 'Alice 35w5d'", () => {
      const result = parseBatchEntry("Alice 35w5d", now);
      expect(result).toEqual(
        expect.objectContaining({ name: "Alice", detail: "35w 5d" }),
      );
      expect("dueDate" in result && result.dueDate).toBeTruthy();
    });

    it("parses 'Bob 35w 5d' (space between w and d)", () => {
      const result = parseBatchEntry("Bob 35w 5d", now);
      expect(result).toEqual(
        expect.objectContaining({ name: "Bob", detail: "35w 5d" }),
      );
    });

    it("parses 'Carol 35 w 5d' (spaces around w)", () => {
      const result = parseBatchEntry("Carol 35 w 5d", now);
      expect(result).toEqual(
        expect.objectContaining({ name: "Carol", detail: "35w 5d" }),
      );
    });

    it("parses 'Mary Jane 20w3d' (multi-word name)", () => {
      const result = parseBatchEntry("Mary Jane 20w3d", now);
      expect(result).toEqual(
        expect.objectContaining({ name: "Mary Jane", detail: "20w 3d" }),
      );
    });

    it("returns error for weeks > 42", () => {
      const result = parseBatchEntry("Alice 45w0d", now);
      expect("error" in result).toBe(true);
    });

    it("returns error for days > 6", () => {
      const result = parseBatchEntry("Alice 35w8d", now);
      expect("error" in result).toBe(true);
    });
  });

  describe("date with slash", () => {
    it("parses 'Alice 6/14' (MM/DD, year inferred)", () => {
      const result = parseBatchEntry("Alice 6/14", now);
      expect(result).toEqual(
        expect.objectContaining({ name: "Alice", dueDate: "2026-06-14" }),
      );
    });

    it("parses 'Bob 6/14/26' (2-digit year)", () => {
      const result = parseBatchEntry("Bob 6/14/26", now);
      expect(result).toEqual(
        expect.objectContaining({ name: "Bob", dueDate: "2026-06-14" }),
      );
    });

    it("parses 'Carol 6/14/2026' (4-digit year)", () => {
      const result = parseBatchEntry("Carol 6/14/2026", now);
      expect(result).toEqual(
        expect.objectContaining({ name: "Carol", dueDate: "2026-06-14" }),
      );
    });

    it("rejects inferred next-year date that exceeds 42-week limit", () => {
      // 1/15 infers 2027, which is > 42 weeks from March 2, 2026
      const result = parseBatchEntry("Alice 1/15", now);
      expect("error" in result && result.error).toBe(
        "Date must be within the next 42 weeks",
      );
    });
  });

  describe("date with hyphen", () => {
    it("parses 'Alice 6-14' (MM-DD, year inferred)", () => {
      const result = parseBatchEntry("Alice 6-14", now);
      expect(result).toEqual(
        expect.objectContaining({ name: "Alice", dueDate: "2026-06-14" }),
      );
    });

    it("parses 'Bob 6-14-26' (2-digit year)", () => {
      const result = parseBatchEntry("Bob 6-14-26", now);
      expect(result).toEqual(
        expect.objectContaining({ name: "Bob", dueDate: "2026-06-14" }),
      );
    });

    it("parses 'Carol 6-14-2026' (4-digit year)", () => {
      const result = parseBatchEntry("Carol 6-14-2026", now);
      expect(result).toEqual(
        expect.objectContaining({ name: "Carol", dueDate: "2026-06-14" }),
      );
    });
  });

  describe("error cases", () => {
    it("returns error for empty string", () => {
      const result = parseBatchEntry("", now);
      expect("error" in result).toBe(true);
    });

    it("returns error for name-only (no date)", () => {
      const result = parseBatchEntry("Alice", now);
      expect("error" in result).toBe(true);
    });

    it("returns error for date-only (no name)", () => {
      const result = parseBatchEntry("6/14", now);
      expect("error" in result).toBe(true);
    });

    it("returns error for invalid month", () => {
      const result = parseBatchEntry("Alice 13/14", now);
      expect("error" in result).toBe(true);
    });

    it("returns error for invalid date (Feb 30)", () => {
      const result = parseBatchEntry("Alice 2/30/2026", now);
      expect("error" in result).toBe(true);
    });

    it("returns error for date too far in the past", () => {
      const result = parseBatchEntry("Alice 1/1/2026", now);
      expect("error" in result && result.error).toBe(
        "Date must be within the last month",
      );
    });

    it("returns error for date too far in the future", () => {
      // 42 weeks from March 2 = Dec 21, 2026; Dec 22 should fail
      const result = parseBatchEntry("Alice 12/22/2026", now);
      expect("error" in result && result.error).toBe(
        "Date must be within the next 42 weeks",
      );
    });

    it("accepts valid gestational age within bounds", () => {
      // 0w0d = due date 280 days away (40 weeks), within 42-week limit
      const result = parseBatchEntry("Alice 0w0d", now);
      expect("dueDate" in result).toBe(true);
    });
  });
});

describe("parseBatchInput", () => {
  it("parses multiple comma-separated entries", () => {
    const { entries, errors } = parseBatchInput(
      "Alice 6/14, Bob 35w5d, Carol 6-14-2026",
      now,
    );
    expect(entries).toHaveLength(3);
    expect(errors).toHaveLength(0);
    expect(entries[0].name).toBe("Alice");
    expect(entries[1].name).toBe("Bob");
    expect(entries[2].name).toBe("Carol");
  });

  it("separates valid entries from errors", () => {
    const { entries, errors } = parseBatchInput(
      "Alice 6/14, Bob, Carol 35w5d",
      now,
    );
    expect(entries).toHaveLength(2);
    expect(errors).toHaveLength(1);
    expect(errors[0].raw).toBe("Bob");
  });

  it("handles empty input", () => {
    const { entries, errors } = parseBatchInput("", now);
    expect(entries).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("handles trailing comma", () => {
    const { entries, errors } = parseBatchInput("Alice 6/14,", now);
    expect(entries).toHaveLength(1);
    expect(errors).toHaveLength(0);
  });
});
