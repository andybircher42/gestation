/**
 * Computes gestational age from a due date.
 *
 * Uses the standard obstetric formula: a due date is 280 days (40 weeks)
 * from the last menstrual period (LMP), so gestational age in days =
 * 280 - days_until_due_date.
 *
 * Result is clamped to 0–308 days (0w0d to 44w0d).
 */
/**
 * Computes a due date from a gestational age in weeks and days.
 *
 * Inverse of computeGestationalAge: dueDate = today + (280 - totalDays) days.
 */
export function computeDueDate(
  weeks: number,
  days: number,
  today: Date = new Date(),
): Date {
  const totalDays = weeks * 7 + days;
  const daysUntilDue = 280 - totalDays;
  const result = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + daysUntilDue,
  );
  return result;
}

export function computeGestationalAge(
  dueDate: Date,
  today: Date = new Date(),
): { weeks: number; days: number } {
  const msPerDay = 86_400_000;
  // Strip time component by comparing UTC date midnights
  const dueMidnight = Date.UTC(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate(),
  );
  const todayMidnight = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const diffDays = Math.round((dueMidnight - todayMidnight) / msPerDay);
  const totalDays = Math.max(0, Math.min(308, 280 - diffDays));
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7 };
}
