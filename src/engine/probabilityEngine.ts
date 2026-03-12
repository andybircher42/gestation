// ---------------------------------------------------------------------------
// Delivery Probability Engine
// ---------------------------------------------------------------------------

import { Entry } from "@/storage";

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

// Heat-map: single color (#391B59) with opacity scaled linearly.
// Max opacity 40% at load >= 0.10 (10% combined delivery probability).
const HEAT_COLOR_R = 0x39;
const HEAT_COLOR_G = 0x1b;
const HEAT_COLOR_B = 0x59;
const MAX_OPACITY = 0.4;
const MAX_LOAD = 0.1; // load at which opacity caps out
const MIN_LOAD = 0.005; // below this, no color shown

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
 * entry has NOT yet delivered by `currentGestationalDay`.
 *
 * P(Y | current = X) = adjustedPDF(Y) / (1 - adjustedCDF(X - 0.5))
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

  let cdfAtCurrent: number;
  if (currentGestationalDay - 0.5 < low) {
    cdfAtCurrent = 0;
  } else if (currentGestationalDay - 0.5 >= inductionDay) {
    cdfAtCurrent = 1;
  } else {
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
 * Convert a calendar date to the entry's gestational day.
 *
 * gestationalDay = 280 - daysBetween(dueDateDate, calendarDate)
 */
export function gestationalDayForDate(
  dueDate: string,
  calendarDate: string,
): number {
  const dueDateObj = parseDate(dueDate);
  const calDate = parseDate(calendarDate);
  const diff = daysBetween(dueDateObj, calDate);
  return 280 - diff;
}

// ---- Aggregation functions ------------------------------------------------

/**
 * Sum of conditional delivery probabilities across all active entries for a
 * given calendar date.
 */
export function deliveryLoadForDate(
  entries: readonly Entry[],
  calendarDate: string,
  today: string,
): number {
  let load = 0;

  for (const entry of entries) {
    const currentGA = gestationalDayForDate(entry.dueDate, today);
    if (currentGA >= HIGH) {
      continue;
    }

    const targetGA = gestationalDayForDate(entry.dueDate, calendarDate);
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
 * Map a numeric delivery load to an rgba color string.
 *
 * Uses #391B59 with opacity linearly scaled from 0 to 40%.
 * Fixed scale: load 0.10 (10%) = 40% opacity. Loads below 0.005 are transparent.
 */
export function colorForLoad(load: number): string {
  if (load < MIN_LOAD) {
    return "transparent";
  }
  const t = Math.min(load / MAX_LOAD, 1);
  const alpha = (t * MAX_OPACITY).toFixed(3);
  return `rgba(${HEAT_COLOR_R},${HEAT_COLOR_G},${HEAT_COLOR_B},${alpha})`;
}

/**
 * Build a heat-map array for every calendar date in [startDate, endDate].
 * Each entry contains { date, load, color }.
 */
export function calendarHeatMap(
  entries: readonly Entry[],
  startDate: string,
  endDate: string,
  today: string,
): HeatMapEntry[] {
  const result: HeatMapEntry[] = [];
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const current = new Date(start);
  while (current <= end) {
    const iso = formatDate(current);
    const load = deliveryLoadForDate(entries, iso, today);
    result.push({ date: iso, load, color: colorForLoad(load) });
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return result;
}
