/** Returns the min and max allowable due dates (1 month ago to 42 weeks ahead). */
export function getDateBounds(now: Date = new Date()): {
  min: Date;
  max: Date;
} {
  const min = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const max = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 7 * 42,
  );
  return { min, max };
}

/** Expands a 2-digit year to 4 digits, using the previous century if more than 10 years in the future. */
export function expandTwoDigitYear(
  shortYear: number,
  now: Date = new Date(),
): number {
  const currentCentury = Math.floor(now.getFullYear() / 100) * 100;
  const candidate = currentCentury + shortYear;
  return candidate > now.getFullYear() + 10 ? candidate - 100 : candidate;
}

const DATE_WITH_YEAR = /^(\d{1,2})-(\d{1,2})-(\d{2,4})$/;
const DATE_NO_YEAR = /^(\d{1,2})-(\d{1,2})-?$/;

/** Infers the year for a month-day pair: uses the current year if the date is today or later, otherwise next year. */
export function inferYear(
  month: number,
  day: number,
  now: Date = new Date(),
): number {
  const thisYear = now.getFullYear();
  const candidate = new Date(thisYear, month - 1, day);
  // Use today at midnight for comparison so "today" counts as this year
  const today = new Date(thisYear, now.getMonth(), now.getDate());
  return candidate >= today ? thisYear : thisYear + 1;
}

/** Extracts month, day, and year from date text. Accepts MM-DD-YYYY, M-D-YY, or MM-DD (year inferred). */
export function parseDateParts(
  text: string,
  now: Date = new Date(),
): { month: number; day: number; year: number; raw: RegExpMatchArray } | null {
  const matchFull = text.match(DATE_WITH_YEAR);
  if (matchFull) {
    const month = parseInt(matchFull[1], 10);
    const day = parseInt(matchFull[2], 10);
    let year = parseInt(matchFull[3], 10);
    if (year < 100) {
      year = expandTwoDigitYear(year, now);
    }
    return { month, day, year, raw: matchFull };
  }
  const matchShort = text.match(DATE_NO_YEAR);
  if (matchShort) {
    const month = parseInt(matchShort[1], 10);
    const day = parseInt(matchShort[2], 10);
    const year = inferYear(month, day, now);
    return { month, day, year, raw: matchShort };
  }
  return null;
}

/** Validates a date text string and returns a user-facing error message, or null if valid. */
export function getDateError(
  text: string,
  now: Date = new Date(),
): string | null {
  if (!text) {
    return null;
  }
  const parts = parseDateParts(text, now);
  if (!parts) {
    return "Enter date as MM-DD-YYYY";
  }
  const { month, day, raw } = parts;
  if (month < 1 || month > 12) {
    return "Month must be 1\u201312";
  }
  if (day < 1 || day > 31) {
    return "Day must be 1\u201331";
  }
  const date = parseDateText(text, now);
  if (!date) {
    return `${raw[1]}-${raw[2]} is not a valid date`;
  }
  const { min, max } = getDateBounds(now);
  if (date < min) {
    return "Date must be within the last month";
  }
  if (date > max) {
    return "Date must be within the next 42 weeks";
  }
  return null;
}

/** Parses a date text string into a Date object, or null if the date is invalid. */
export function parseDateText(
  text: string,
  now: Date = new Date(),
): Date | null {
  const parts = parseDateParts(text, now);
  if (!parts) {
    return null;
  }
  const { month, day, year } = parts;
  if (month < 1 || month > 12) {
    return null;
  }
  if (day < 1 || day > 31) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Normalizes a date text string to MM-DD-YYYY format, or null if the pattern doesn't match. */
export function formatDateInput(
  text: string,
  now: Date = new Date(),
): string | null {
  const parts = parseDateParts(text, now);
  if (!parts) {
    return null;
  }
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return `${month}-${day}-${parts.year}`;
}

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Formats an ISO date string for display: "Jun 15" (same year) or "Jun 15 '26" (different year). */
export function formatDueDate(isoDate: string, now: Date = new Date()): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const month = SHORT_MONTHS[m - 1];
  if (!month || isNaN(d) || isNaN(y)) {
    return isoDate;
  }
  if (y === now.getFullYear()) {
    return `${month} ${d}`;
  }
  return `${month} ${d} '${String(y).slice(-2)}`;
}

/** Formats a Date as a display date string (MM-DD-YYYY). */
export function toDisplayDateString(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${m}-${d}-${date.getFullYear()}`;
}

/** Formats a Date as an ISO date string (YYYY-MM-DD). */
export function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Returns a human-readable label describing how early or late a delivery was
 * relative to the due date. Returns "On time" if delivered on the due date.
 */
export function deliveryTimingLabel(
  dueDate: string,
  deliveredAt: number,
): string {
  const due = new Date(dueDate + "T00:00:00");
  const delivered = new Date(deliveredAt);
  // Compare dates only (ignore time)
  const dueDay = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate(),
  ).getTime();
  const deliveredDay = new Date(
    delivered.getFullYear(),
    delivered.getMonth(),
    delivered.getDate(),
  ).getTime();
  const diffDays = Math.round((dueDay - deliveredDay) / 86_400_000);

  if (diffDays === 0) {return "On time";}
  if (diffDays > 0) {
    if (diffDays >= 7) {
      const weeks = Math.floor(diffDays / 7);
      const days = diffDays % 7;
      return days > 0 ? `${weeks}w ${days}d early` : `${weeks}w early`;
    }
    return `${diffDays}d early`;
  }
  const absDiff = Math.abs(diffDays);
  if (absDiff >= 7) {
    const weeks = Math.floor(absDiff / 7);
    const days = absDiff % 7;
    return days > 0 ? `${weeks}w ${days}d late` : `${weeks}w late`;
  }
  return `${absDiff}d late`;
}
