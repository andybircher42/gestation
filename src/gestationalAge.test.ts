import { computeGestationalAge } from "./gestationalAge";

describe("computeGestationalAge", () => {
  it("returns 40w0d when due date equals today", () => {
    const today = new Date(2026, 2, 2); // March 2, 2026
    const result = computeGestationalAge(today, today);
    expect(result).toEqual({ weeks: 40, days: 0 });
  });

  it("returns 0w0d when due date is 280+ days in the future", () => {
    const today = new Date(2026, 2, 2);
    const dueDate = new Date(2026, 11, 20); // 293 days ahead
    const result = computeGestationalAge(dueDate, today);
    expect(result).toEqual({ weeks: 0, days: 0 });
  });

  it("computes correct age for a typical mid-pregnancy due date", () => {
    // Due date 56 days from today → 280 - 56 = 224 days = 32w0d
    const today = new Date(2026, 0, 1);
    const dueDate = new Date(2026, 1, 26); // 56 days later
    const result = computeGestationalAge(dueDate, today);
    expect(result).toEqual({ weeks: 32, days: 0 });
  });

  it("handles fractional week results", () => {
    // Due date 53 days from today → 280 - 53 = 227 days = 32w3d
    const today = new Date(2026, 0, 1);
    const dueDate = new Date(2026, 1, 23); // 53 days later
    const result = computeGestationalAge(dueDate, today);
    expect(result).toEqual({ weeks: 32, days: 3 });
  });

  it("clamps to 0 when gestational age would be negative", () => {
    // Due date far in the future
    const today = new Date(2026, 0, 1);
    const dueDate = new Date(2027, 0, 1); // 365 days later
    const result = computeGestationalAge(dueDate, today);
    expect(result).toEqual({ weeks: 0, days: 0 });
  });

  it("clamps to 308 (44w0d) when due date is far in the past", () => {
    // Due date 100 days ago → 280 - (-100) = 380, clamped to 308 = 44w0d
    const today = new Date(2026, 3, 10);
    const dueDate = new Date(2026, 0, 1); // 99 days before
    const result = computeGestationalAge(dueDate, today);
    expect(result).toEqual({ weeks: 44, days: 0 });
  });

  it("returns 39w6d when due date is 1 day away", () => {
    const today = new Date(2026, 2, 2);
    const dueDate = new Date(2026, 2, 3); // 1 day later
    const result = computeGestationalAge(dueDate, today);
    expect(result).toEqual({ weeks: 39, days: 6 });
  });

  it("returns 40w1d when due date was yesterday", () => {
    const today = new Date(2026, 2, 2);
    const dueDate = new Date(2026, 2, 1); // 1 day before
    const result = computeGestationalAge(dueDate, today);
    expect(result).toEqual({ weeks: 40, days: 1 });
  });

  it("defaults today to current date when not provided", () => {
    // Just verify it doesn't throw — exact value depends on current date
    const farFuture = new Date(2030, 0, 1);
    const result = computeGestationalAge(farFuture);
    expect(result.weeks).toBeGreaterThanOrEqual(0);
    expect(result.days).toBeGreaterThanOrEqual(0);
    expect(result.days).toBeLessThanOrEqual(6);
  });
});
