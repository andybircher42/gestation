import {
  expandTwoDigitYear,
  getDateBounds,
  inferYear,
  parseDateText,
  toISODateString,
} from "./dateUtils";
import { computeDueDate, computeGestationalAge } from "./gestationalAge";

/** Result of parsing a single batch entry. */
export interface BatchEntryResult {
  name: string;
  dueDate: string;
  detail: string;
}

/** Error from parsing a single batch entry. */
export interface BatchEntryError {
  raw: string;
  error: string;
}

// Gestational age at end: "35w5d", "35w 5d", "35 w 5 d"
const GA_PATTERN = /(\d{1,2})\s*w\s*(\d)\s*d\s*$/i;

// Date with slash: "6/14", "6/14/25", "6/14/2026"
const DATE_SLASH_PATTERN = /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\s*$/;

// Date with hyphen: "6-14", "6-14-25", "6-14-2026"
const DATE_HYPHEN_PATTERN = /(\d{1,2})-(\d{1,2})(?:-(\d{2,4}))?\s*$/;

/**
 * Parses a single batch entry string like "Alice 6/14" or "Bob 35w5d"
 * into a name + due date, or returns an error.
 */
export function parseBatchEntry(
  text: string,
  now: Date = new Date(),
): BatchEntryResult | BatchEntryError {
  const trimmed = text.trim();
  if (!trimmed) {
    return { raw: text, error: "Nothing entered" };
  }

  // Try gestational age first
  const gaMatch = trimmed.match(GA_PATTERN);
  if (gaMatch) {
    const name = trimmed.slice(0, gaMatch.index!).trim();
    if (!name) {
      return { raw: trimmed, error: "Needs a name before the date" };
    }
    if (name.length > 50) {
      return { raw: trimmed, error: "Name must be 50 characters or fewer" };
    }
    const weeks = parseInt(gaMatch[1], 10);
    const days = parseInt(gaMatch[2], 10);
    if (weeks > 42) {
      return { raw: trimmed, error: `Weeks must be 0\u201342` };
    }
    if (days > 6) {
      return { raw: trimmed, error: `Days must be 0\u20136` };
    }
    const dueDate = computeDueDate(weeks, days, now);
    const { min, max } = getDateBounds(now);
    if (dueDate < min) {
      return { raw: trimmed, error: "Due date must be within the last month" };
    }
    if (dueDate > max) {
      return {
        raw: trimmed,
        error: "Due date must be within the next 42 weeks",
      };
    }
    return {
      name,
      dueDate: toISODateString(dueDate),
      detail: `${weeks}w ${days}d`,
    };
  }

  // Try date with slash
  const slashMatch = trimmed.match(DATE_SLASH_PATTERN);
  if (slashMatch) {
    return parseDateEntry(trimmed, slashMatch, now);
  }

  // Try date with hyphen
  const hyphenMatch = trimmed.match(DATE_HYPHEN_PATTERN);
  if (hyphenMatch) {
    return parseDateEntry(trimmed, hyphenMatch, now);
  }

  return {
    raw: trimmed,
    error: "Couldn\u2019t find a date or gestational age",
  };
}

/** Shared logic for parsing a date match (slash or hyphen) into a BatchEntryResult. */
function parseDateEntry(
  trimmed: string,
  match: RegExpMatchArray,
  now: Date,
): BatchEntryResult | BatchEntryError {
  const name = trimmed.slice(0, match.index!).trim();
  if (!name) {
    return { raw: trimmed, error: "Needs a name before the date" };
  }
  if (name.length > 50) {
    return { raw: trimmed, error: "Name must be 50 characters or fewer" };
  }

  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);

  if (month < 1 || month > 12) {
    return { raw: trimmed, error: `Month must be 1\u201312` };
  }
  if (day < 1 || day > 31) {
    return { raw: trimmed, error: `Day must be 1\u201331` };
  }

  let year: number;
  if (match[3]) {
    year = parseInt(match[3], 10);
    if (year < 100) {
      year = expandTwoDigitYear(year, now);
    }
  } else {
    year = inferYear(month, day, now);
  }

  // Validate by parsing as a normalized date string
  const dateStr = `${month}-${day}-${year}`;
  const date = parseDateText(dateStr, now);
  if (!date) {
    return { raw: trimmed, error: `${month}-${day} is not a valid date` };
  }

  const { min, max } = getDateBounds(now);
  if (date < min) {
    return { raw: trimmed, error: "Date must be within the last month" };
  }
  if (date > max) {
    return { raw: trimmed, error: "Date must be within the next 42 weeks" };
  }

  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");

  return {
    name,
    dueDate: toISODateString(date),
    detail: `${m}-${d}-${year}`,
  };
}

/** Result of parsing a standalone date or gestational age string (no name). */
export interface ParsedDateOrAge {
  dueDate: Date;
  weeks: number;
  days: number;
}

// Standalone gestational age (anchored): "35w5d", "35w 5d", "35 w 5 d"
const GA_STANDALONE = /^(\d{1,2})\s*w\s*(\d)\s*d\s*$/i;

// Standalone date with slash (anchored): "6/14", "6/14/26"
const DATE_SLASH_STANDALONE = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/;

// Standalone date with hyphen (anchored): "6-14", "6-14-26"
const DATE_HYPHEN_STANDALONE = /^(\d{1,2})-(\d{1,2})(?:-(\d{2,4}))?$/;

/**
 * Parses a standalone date or gestational age string (no name prefix).
 * Returns the parsed due date + gestational age, an error string, or null
 * if the input is not yet recognizable.
 */
export function parseDateOrAge(
  text: string,
  now: Date = new Date(),
): ParsedDateOrAge | { error: string } | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  // Try gestational age
  const gaMatch = trimmed.match(GA_STANDALONE);
  if (gaMatch) {
    const weeks = parseInt(gaMatch[1], 10);
    const days = parseInt(gaMatch[2], 10);
    if (weeks > 42) {
      return { error: "Weeks must be 0\u201342" };
    }
    if (days > 6) {
      return { error: "Days must be 0\u20136" };
    }
    const dueDate = computeDueDate(weeks, days, now);
    const { min, max } = getDateBounds(now);
    if (dueDate < min) {
      return { error: "Due date must be within the last month" };
    }
    if (dueDate > max) {
      return { error: "Due date must be within the next 42 weeks" };
    }
    return { dueDate, weeks, days };
  }

  // Try date with slash
  const slashMatch = trimmed.match(DATE_SLASH_STANDALONE);
  if (slashMatch) {
    return parseDateStandalone(slashMatch, now);
  }

  // Try date with hyphen
  const hyphenMatch = trimmed.match(DATE_HYPHEN_STANDALONE);
  if (hyphenMatch) {
    return parseDateStandalone(hyphenMatch, now);
  }

  return null;
}

/** Parses a standalone date match into a ParsedDateOrAge or error. */
function parseDateStandalone(
  match: RegExpMatchArray,
  now: Date,
): ParsedDateOrAge | { error: string } {
  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);

  if (month < 1 || month > 12) {
    return { error: "Month must be 1\u201312" };
  }
  if (day < 1 || day > 31) {
    return { error: "Day must be 1\u201331" };
  }

  let year: number;
  if (match[3]) {
    year = parseInt(match[3], 10);
    if (year < 100) {
      year = expandTwoDigitYear(year, now);
    }
  } else {
    year = inferYear(month, day, now);
  }

  const dateStr = `${month}-${day}-${year}`;
  const date = parseDateText(dateStr, now);
  if (!date) {
    return { error: `${month}-${day} is not a valid date` };
  }

  const { min, max } = getDateBounds(now);
  if (date < min) {
    return { error: "Date must be within the last month" };
  }
  if (date > max) {
    return { error: "Date must be within the next 42 weeks" };
  }

  const ga = computeGestationalAge(date, now);
  return { dueDate: date, weeks: ga.weeks, days: ga.days };
}

/**
 * Parses comma-separated batch input into an array of results and errors.
 * Returns the successfully parsed entries and any errors.
 */
export function parseBatchInput(
  text: string,
  now: Date = new Date(),
): { entries: BatchEntryResult[]; errors: BatchEntryError[] } {
  const entries: BatchEntryResult[] = [];
  const errors: BatchEntryError[] = [];

  const parts = text.split(",").filter((p) => p.trim().length > 0);
  for (const part of parts) {
    const result = parseBatchEntry(part, now);
    if ("error" in result) {
      errors.push(result);
    } else {
      entries.push(result);
    }
  }

  return { entries, errors };
}
