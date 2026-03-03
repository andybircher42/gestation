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

const DATE_PATTERN = /^(\d{1,2})-(\d{1,2})-(\d{2,4})$/;

/** Extracts month, day, and year from an MM-DD-YYYY or M-D-YY text string, expanding 2-digit years. */
export function parseDateParts(
  text: string,
  now: Date = new Date(),
): { month: number; day: number; year: number; raw: RegExpMatchArray } | null {
  const match = text.match(DATE_PATTERN);
  if (!match) {
    return null;
  }
  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  let year = parseInt(match[3], 10);
  if (year < 100) {
    year = expandTwoDigitYear(year, now);
  }
  return { month, day, year, raw: match };
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
    return "Date is too far in the past";
  }
  if (date > max) {
    return "Date is too far in the future";
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
  if (y === now.getFullYear()) {
    return `${month} ${d}`;
  }
  return `${month} ${d} '${String(y).slice(-2)}`;
}

/** Formats a Date as an ISO date string (YYYY-MM-DD). */
export function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
