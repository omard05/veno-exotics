export function formatMoney(cents: number, opts: { cents?: boolean } = {}): string {
  const showCents = opts.cents ?? cents % 100 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(cents / 100);
}

/** Parses "$1,234.50" / "1234.5" into cents. Returns NaN when invalid. */
export function parseMoney(input: unknown): number {
  if (typeof input !== "string" && typeof input !== "number") return NaN;
  const n = Number(String(input).replace(/[$,\s]/g, ""));
  if (!isFinite(n) || n < 0) return NaN;
  return Math.round(n * 100);
}
