import {
  expandTwoDigitYear,
  formatDateInput,
  formatDueDate,
  getDateBounds,
  getDateError,
  parseDateParts,
  parseDateText,
  toDisplayDateString,
  toISODateString,
} from "./dateUtils";

describe("formatDueDate", () => {
  it("formats same-year date as 'Mon D'", () => {
    const now = new Date(2026, 2, 2);
    expect(formatDueDate("2026-06-15", now)).toBe("Jun 15");
  });

  it('formats different-year date as "Mon D \'YY"', () => {
    const now = new Date(2026, 2, 2);
    expect(formatDueDate("2027-01-03", now)).toBe("Jan 3 '27");
  });

  it("formats past different-year date", () => {
    const now = new Date(2026, 2, 2);
    expect(formatDueDate("2025-12-25", now)).toBe("Dec 25 '25");
  });

  it("returns the raw string for malformed input", () => {
    expect(formatDueDate("garbage")).toBe("garbage");
    expect(formatDueDate("")).toBe("");
  });
});

describe("expandTwoDigitYear", () => {
  // now = March 2, 2026 → cutoff = 2036
  const now = new Date(2026, 2, 2);

  it("expands 26 to 2026", () => {
    expect(expandTwoDigitYear(26, now)).toBe(2026);
  });

  it("expands 36 to 2036 (exactly 10 years ahead)", () => {
    expect(expandTwoDigitYear(36, now)).toBe(2036);
  });

  it("expands 37 to 1937 (more than 10 years ahead)", () => {
    expect(expandTwoDigitYear(37, now)).toBe(1937);
  });

  it("expands 0 to 2000", () => {
    expect(expandTwoDigitYear(0, now)).toBe(2000);
  });

  it("expands 99 to 1999", () => {
    expect(expandTwoDigitYear(99, now)).toBe(1999);
  });

  it("expands 40 to 1940", () => {
    expect(expandTwoDigitYear(40, now)).toBe(1940);
  });
});

describe("getDateError", () => {
  // Use a fixed "now" so range checks are deterministic: March 2, 2026
  const now = new Date(2026, 2, 2);

  it("returns null for empty string", () => {
    expect(getDateError("", now)).toBeNull();
  });

  it("returns null for valid date", () => {
    expect(getDateError("6-15-2026", now)).toBeNull();
  });

  it("returns null for valid date with 2-digit year within 10 years", () => {
    expect(getDateError("6-15-26", now)).toBeNull();
  });

  it("treats 2-digit year as 1900s when more than 10 years in the future", () => {
    // "99" → 1999, which is far in the past
    expect(getDateError("6-15-99", now)).toBe("Date is too far in the past");
  });

  it("returns null for valid date with leading zeros", () => {
    expect(getDateError("06-05-2026", now)).toBeNull();
  });

  it("returns format error for incomplete input", () => {
    expect(getDateError("6-15", now)).toBe("Enter date as MM-DD-YYYY");
  });

  it("returns format error for text without hyphens", () => {
    expect(getDateError("abc", now)).toBe("Enter date as MM-DD-YYYY");
  });

  it("returns format error for too many digits in month", () => {
    expect(getDateError("123-1-2026", now)).toBe("Enter date as MM-DD-YYYY");
  });

  it("returns month error for month 0", () => {
    expect(getDateError("0-15-2026", now)).toMatch(/Month must be/);
  });

  it("returns month error for month 13", () => {
    expect(getDateError("13-15-2026", now)).toMatch(/Month must be/);
  });

  it("returns day error for day 0", () => {
    expect(getDateError("6-0-2026", now)).toMatch(/Day must be/);
  });

  it("returns day error for day 32", () => {
    expect(getDateError("6-32-2026", now)).toMatch(/Day must be/);
  });

  it("returns invalid date error for Feb 30", () => {
    expect(getDateError("2-30-2026", now)).toBe("2-30 is not a valid date");
  });

  it("returns invalid date error for Feb 29 in non-leap year", () => {
    expect(getDateError("2-29-2027", now)).toBe("2-29 is not a valid date");
  });

  it("returns null for Feb 29 in leap year", () => {
    const nowForLeapYear = new Date(2028, 0, 1);
    expect(getDateError("2-29-2028", nowForLeapYear)).toBeNull();
  });

  it("returns invalid date error for Apr 31", () => {
    expect(getDateError("4-31-2026", now)).toBe("4-31 is not a valid date");
  });

  it("returns error for date more than 1 month in the past", () => {
    expect(getDateError("1-1-2026", now)).toBe("Date is too far in the past");
  });

  it("returns null for date exactly 1 month in the past", () => {
    expect(getDateError("2-2-2026", now)).toBeNull();
  });

  it("returns error for date more than 42 weeks in the future", () => {
    // 42 weeks from March 2 = Dec 21, 2026; Dec 22 should fail
    expect(getDateError("12-22-2026", now)).toBe(
      "Date is too far in the future",
    );
  });

  it("returns null for date exactly 42 weeks in the future", () => {
    expect(getDateError("12-21-2026", now)).toBeNull();
  });
});

describe("getDateBounds", () => {
  it("returns min as 1 month before now", () => {
    const now = new Date(2026, 2, 2);
    const { min } = getDateBounds(now);
    expect(min).toEqual(new Date(2026, 1, 2));
  });

  it("returns max as 40 weeks after now", () => {
    const now = new Date(2026, 2, 2);
    const { max } = getDateBounds(now);
    expect(max).toEqual(new Date(2026, 2, 2 + 294));
  });
});

describe("parseDateText", () => {
  // Invalid-input cases (null returns) are covered by getDateError tests,
  // which delegates to parseDateText internally. These tests focus on
  // successful parsing and edge cases unique to parseDateText.

  it("parses a valid M-D-YYYY date", () => {
    const date = parseDateText("6-15-2026");
    expect(date).toEqual(new Date(2026, 5, 15));
  });

  it("parses a valid MM-DD-YYYY date", () => {
    const date = parseDateText("01-05-2026");
    expect(date).toEqual(new Date(2026, 0, 5));
  });

  it("parses a 2-digit year as 20xx when within 10 years", () => {
    const date = parseDateText("6-15-26");
    expect(date).toEqual(new Date(2026, 5, 15));
  });

  it("parses a 2-digit year as 19xx when more than 10 years in the future", () => {
    const date = parseDateText("6-15-99");
    expect(date).toEqual(new Date(1999, 5, 15));
  });

  it("parses Feb 29 in leap year", () => {
    expect(parseDateText("2-29-2028")).toEqual(new Date(2028, 1, 29));
  });

  it("returns null for single-digit year", () => {
    expect(parseDateText("6-15-6")).toBeNull();
  });
});

describe("parseDateParts", () => {
  const now = new Date(2026, 2, 2);

  it("returns null for non-matching input", () => {
    expect(parseDateParts("abc", now)).toBeNull();
  });

  it("returns null for incomplete date", () => {
    expect(parseDateParts("6-15", now)).toBeNull();
  });

  it("extracts month, day, and 4-digit year", () => {
    const result = parseDateParts("6-15-2026", now);
    expect(result).toEqual(
      expect.objectContaining({ month: 6, day: 15, year: 2026 }),
    );
  });

  it("extracts month and day with leading zeros", () => {
    const result = parseDateParts("01-05-2026", now);
    expect(result).toEqual(
      expect.objectContaining({ month: 1, day: 5, year: 2026 }),
    );
  });

  it("expands a 2-digit year", () => {
    const result = parseDateParts("6-15-26", now);
    expect(result).toEqual(
      expect.objectContaining({ month: 6, day: 15, year: 2026 }),
    );
  });

  it("includes the raw RegExp match", () => {
    const result = parseDateParts("6-15-2026", now);
    expect(result!.raw[0]).toBe("6-15-2026");
  });
});

describe("formatDateInput", () => {
  const now = new Date(2026, 2, 2);

  it("returns null for non-matching input", () => {
    expect(formatDateInput("abc", now)).toBeNull();
  });

  it("normalizes single-digit month and day to MM-DD-YYYY", () => {
    expect(formatDateInput("6-5-2026", now)).toBe("06-05-2026");
  });

  it("preserves already-padded input", () => {
    expect(formatDateInput("06-15-2026", now)).toBe("06-15-2026");
  });

  it("expands a 2-digit year", () => {
    expect(formatDateInput("6-15-26", now)).toBe("06-15-2026");
  });
});

describe("toDisplayDateString", () => {
  it("formats a date as MM-DD-YYYY", () => {
    expect(toDisplayDateString(new Date(2026, 5, 15))).toBe("06-15-2026");
  });

  it("zero-pads single-digit month and day", () => {
    expect(toDisplayDateString(new Date(2026, 0, 5))).toBe("01-05-2026");
  });

  it("handles Dec 31 correctly", () => {
    expect(toDisplayDateString(new Date(2026, 11, 31))).toBe("12-31-2026");
  });
});

describe("toISODateString", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(toISODateString(new Date(2026, 5, 15))).toBe("2026-06-15");
  });

  it("zero-pads single-digit month and day", () => {
    expect(toISODateString(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("handles Dec 31 correctly", () => {
    expect(toISODateString(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});
