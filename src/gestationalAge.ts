/**
 * Computes gestational age from a due date.
 *
 * Uses the standard obstetric formula: a due date is 280 days (40 weeks)
 * from the last menstrual period (LMP), so gestational age in days =
 * 280 - days_until_due_date.
 *
 * Result is clamped to 0–308 days (0w0d to 44w0d).
 */
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
