// ---------------------------------------------------------------------------
// Delivery Probability Engine
// ---------------------------------------------------------------------------

export interface Patient {
  id: string;
  name: string;
  edd: string; // ISO date YYYY-MM-DD (estimated due date)
  lmpDate?: string;
  birthstone: {
    name: string;
    color: string;
  };
}

export interface HeatMapEntry {
  date: string; // ISO YYYY-MM-DD
  load: number;
  color: string;
}

// ---- Constants ------------------------------------------------------------

const MU = 280;
const SIGMA = 10;
const LOW = 140;
const HIGH = 301;
const INDUCTION_DAY = 287; // 41w0d

const COLOR_NONE = "#F0F4F8";
const COLOR_LOW = "#A8D5A2";
const COLOR_MEDIUM = "#F9C74F";
const COLOR_HIGH = "#F4845F";
const COLOR_PEAK = "#C1121F";

// ---- Math helpers ---------------------------------------------------------

/**
 * Error function approximation using Abramowitz & Stegun formula 7.1.26
 * (Horner-form polynomial approximation). Max error ~1.5e-7.
 */
export function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const a = Math.abs(x);

  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  const t = 1.0 / (1.0 + p * a);
  const t2 = t * t;
  const t3 = t2 * t;
  const t4 = t3 * t;
  const t5 = t4 * t;

  const y =
    1.0 - (a1 * t + a2 * t2 + a3 * t3 + a4 * t4 + a5 * t5) * Math.exp(-a * a);
  return sign * y;
}

/** CDF of a normal distribution N(mu, sigma). */
export function normalCDF(x: number, mu: number, sigma: number): number {
  return 0.5 * (1.0 + erf((x - mu) / (sigma * Math.SQRT2)));
}

/** PDF of a normal distribution N(mu, sigma). */
export function normalPDF(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2.0 * Math.PI));
}

// ---- Core probability functions -------------------------------------------

/**
 * PDF of a truncated normal distribution on [low, high].
 * Returns 0 for values outside the support.
 */
export function truncatedNormalPDF(
  day: number,
  mu: number,
  sigma: number,
  low: number,
  high: number,
): number {
  if (day < low || day > high) {
    return 0;
  }

  const denom = normalCDF(high, mu, sigma) - normalCDF(low, mu, sigma);
  if (denom === 0) {
    return 0;
  }

  return normalPDF(day, mu, sigma) / denom;
}

/**
 * Induction-adjusted PDF.
 *
 * - Days [low, inductionDay-1]: regular truncated normal PDF
 * - Day inductionDay: truncated normal PDF at that day PLUS all tail
 *   probability mass from (inductionDay+0.5) to high  (i.e. days 288-301)
 * - Days > inductionDay: 0
 */
export function inductionAdjustedPDF(
  day: number,
  mu: number,
  sigma: number,
  low: number,
  high: number,
  inductionDay: number,
): number {
  if (day < low || day > high) {
    return 0;
  }
  if (day > inductionDay) {
    return 0;
  }

  const denom = normalCDF(high, mu, sigma) - normalCDF(low, mu, sigma);
  if (denom === 0) {
    return 0;
  }

  const basePDF = normalPDF(day, mu, sigma) / denom;

  if (day === inductionDay) {
    // Add the tail probability mass from inductionDay+0.5 onward
    const tailMass =
      (normalCDF(high, mu, sigma) - normalCDF(inductionDay + 0.5, mu, sigma)) /
      denom;
    return basePDF + tailMass;
  }

  return basePDF;
}

/**
 * Conditional probability of delivering on `deliveryDay` given that the
 * patient has NOT yet delivered by `currentGestationalDay`.
 *
 * P(Y | current = X) = adjustedPDF(Y) / (1 - adjustedCDF(X - 0.5))
 *
 * where adjustedCDF is the cumulative sum of the induction-adjusted PDF
 * from low to the given day.
 */
export function conditionalProbability(
  deliveryDay: number,
  currentGestationalDay: number,
  mu: number,
  sigma: number,
  low: number,
  high: number,
  inductionDay: number,
): number {
  if (deliveryDay < low || deliveryDay > high) {
    return 0;
  }
  if (deliveryDay <= currentGestationalDay) {
    return 0;
  }
  if (deliveryDay > inductionDay) {
    return 0;
  }

  const denom = normalCDF(high, mu, sigma) - normalCDF(low, mu, sigma);
  if (denom === 0) {
    return 0;
  }

  const pdfValue = inductionAdjustedPDF(
    deliveryDay,
    mu,
    sigma,
    low,
    high,
    inductionDay,
  );

  // CDF of the induction-adjusted distribution up to (currentGestationalDay - 0.5).
  // For days below the induction cutoff the adjusted CDF equals the truncated
  // normal CDF.  At/above the induction day the entire remaining mass is
  // concentrated on inductionDay itself.
  let cdfAtCurrent: number;
  if (currentGestationalDay - 0.5 < low) {
    cdfAtCurrent = 0;
  } else if (currentGestationalDay - 0.5 >= inductionDay) {
    // All probability mass has been assigned (days > inductionDay are 0),
    // so the adjusted CDF equals 1.
    cdfAtCurrent = 1;
  } else {
    // Truncated normal CDF up to currentGestationalDay - 0.5
    cdfAtCurrent =
      (normalCDF(currentGestationalDay - 0.5, mu, sigma) -
        normalCDF(low, mu, sigma)) /
      denom;
  }

  const survival = 1.0 - cdfAtCurrent;
  if (survival <= 0) {
    return 0;
  }

  return pdfValue / survival;
}

// ---- Date helpers ---------------------------------------------------------

/** Parse an ISO YYYY-MM-DD string into a Date at midnight UTC. */
function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Difference in whole days: (a - b) in days. */
function daysBetween(a: Date, b: Date): number {
  const MS_PER_DAY = 86_400_000;
  return Math.round((a.getTime() - b.getTime()) / MS_PER_DAY);
}

/** Format a Date (UTC) back to ISO YYYY-MM-DD. */
function formatDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Convert a calendar date to the patient's gestational day.
 *
 * gestationalDay = 280 - daysBetween(eddDate, calendarDate)
 *
 * e.g. if EDD is June 15 and calendar date is June 10 (5 days before EDD),
 * gestationalDay = 280 - 5 = 275.
 */
export function gestationalDayForDate(
  edd: string,
  calendarDate: string,
): number {
  const eddDate = parseDate(edd);
  const calDate = parseDate(calendarDate);
  const diff = daysBetween(eddDate, calDate); // positive when calDate is before EDD
  return 280 - diff;
}

// ---- Aggregation functions ------------------------------------------------

/**
 * Sum of conditional delivery probabilities across all active patients for a
 * given calendar date.
 *
 * A patient is "active" when:
 *   - Their current gestational day (based on `today`) is in [140, 300]
 *   - The target calendar date's gestational day is > current gestational day
 *
 * Uses default parameters: mu=280, sigma=10, low=140, high=301, inductionDay=287.
 */
export function deliveryLoadForDate(
  patients: readonly Patient[],
  calendarDate: string,
  today: string,
): number {
  let load = 0;

  for (const patient of patients) {
    const currentGA = gestationalDayForDate(patient.edd, today);
    if (currentGA >= HIGH) {
      continue;
    }

    const targetGA = gestationalDayForDate(patient.edd, calendarDate);
    if (targetGA <= currentGA) {
      continue;
    }

    load += conditionalProbability(
      targetGA,
      currentGA,
      MU,
      SIGMA,
      LOW,
      HIGH,
      INDUCTION_DAY,
    );
  }

  return load;
}

/**
 * Map a numeric delivery load to a hex color string.
 */
export function colorForLoad(load: number): string {
  if (load < 0.005) {
    return COLOR_NONE;
  }
  if (load <= 0.02) {
    return COLOR_LOW;
  }
  if (load <= 0.05) {
    return COLOR_MEDIUM;
  }
  if (load <= 0.1) {
    return COLOR_HIGH;
  }
  return COLOR_PEAK;
}

/**
 * Build a heat-map array for every calendar date in [startDate, endDate].
 *
 * Each entry contains { date, load, color }.
 */
export function calendarHeatMap(
  patients: readonly Patient[],
  startDate: string,
  endDate: string,
  today: string,
): HeatMapEntry[] {
  const entries: HeatMapEntry[] = [];
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const current = new Date(start);
  while (current <= end) {
    const iso = formatDate(current);
    const load = deliveryLoadForDate(patients, iso, today);
    entries.push({ date: iso, load, color: colorForLoad(load) });
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return entries;
}
