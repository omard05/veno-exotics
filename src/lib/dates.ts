/** Date helpers. All business dates are Newport Beach local time (America/Los_Angeles). */

export const BUSINESS_TZ = "America/Los_Angeles";

/** Today's date in Newport Beach as YYYY-MM-DD. */
export function todayLA(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function isDateStr(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + "T00:00:00Z"));
}

export function isTimeStr(s: unknown): s is string {
  return typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}

/** Wall-clock timestamp (ms) for a local date + time; DST-neutral, used only for durations. */
export function wallMs(date: string, time = "00:00"): number {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return Date.UTC(y, m - 1, d, hh, mm);
}

export function addDays(date: string, n: number): string {
  const ms = wallMs(date) + n * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

/** Inclusive list of dates from start to end. */
export function eachDate(start: string, end: string): string[] {
  const out: string[] = [];
  for (let d = start; d <= end && out.length < 1000; d = addDays(d, 1)) out.push(d);
  return out;
}

export function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart <= bEnd && bStart <= aEnd;
}

export function formatDate(date: string, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts,
  }).format(new Date(wallMs(date)));
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** 30-minute time slots across the full day (VENO operates 24 hours). */
export const TIME_SLOTS: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  return `${h}:${i % 2 ? "30" : "00"}`;
});
