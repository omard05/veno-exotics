import { addDays, todayLA, wallMs } from "./dates";

/** Minimal shapes so this module can run on both server and client. */
export type PricingVehicle = {
  id: number;
  dailyPriceCents: number;
  depositCents: number;
  includedMilesPerDay: number;
  extraMileCents: number;
  minDays: number;
};

export type PricingPromotion = {
  id: number;
  title: string;
  vehicleIds: number[];
  promoDailyPriceCents: number;
  startsOn: string;
  endsOn: string;
  enabled: boolean;
};

/** A promotion is live only while today (Newport Beach time) is inside its window. */
export function isPromoLive(p: PricingPromotion, today = todayLA()): boolean {
  return p.enabled && p.startsOn <= today && today <= p.endsOn;
}

/** The live promotion for a vehicle today, if any (lowest price wins). */
export function livePromoFor(
  vehicleId: number,
  promos: PricingPromotion[],
  today = todayLA(),
): PricingPromotion | undefined {
  return promos
    .filter((p) => isPromoLive(p, today) && p.vehicleIds.includes(vehicleId))
    .sort((a, b) => a.promoDailyPriceCents - b.promoDailyPriceCents)[0];
}

/** Rental days: every started 24-hour period counts as a day; never below the vehicle minimum. */
export function rentalDays(
  pickupDate: string,
  pickupTime: string,
  returnDate: string,
  returnTime: string,
): number {
  const ms = wallMs(returnDate, returnTime) - wallMs(pickupDate, pickupTime);
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
}

export type EstimateLine = { label: string; days: number; rateCents: number; amountCents: number };

export type Estimate = {
  days: number;
  billedDays: number;
  lines: EstimateLine[];
  subtotalCents: number;
  regularSubtotalCents: number;
  savingsCents: number;
  includedMiles: number;
  extraMileCents: number;
  depositCents: number;
  promoTitle?: string;
};

/**
 * Estimated rental charges. Each rental day is priced on its own date: a live promotion
 * applies to rental days that fall inside the promotion window; other days use the regular rate.
 */
export function estimate(
  v: PricingVehicle,
  promos: PricingPromotion[],
  pickupDate: string,
  pickupTime: string,
  returnDate: string,
  returnTime: string,
  today = todayLA(),
): Estimate | null {
  const days = rentalDays(pickupDate, pickupTime, returnDate, returnTime);
  if (days <= 0) return null;
  const billedDays = Math.max(days, v.minDays || 1);

  let promoDays = 0;
  let promoRate = 0;
  let promoTitle: string | undefined;
  for (let i = 0; i < billedDays; i++) {
    const date = addDays(pickupDate, i);
    const live = promos
      .filter(
        (p) =>
          isPromoLive(p, today) &&
          p.vehicleIds.includes(v.id) &&
          p.startsOn <= date &&
          date <= p.endsOn &&
          p.promoDailyPriceCents < v.dailyPriceCents,
      )
      .sort((a, b) => a.promoDailyPriceCents - b.promoDailyPriceCents)[0];
    if (live) {
      promoDays++;
      promoRate = live.promoDailyPriceCents;
      promoTitle = live.title;
    }
  }
  const regularDays = billedDays - promoDays;
  const lines: EstimateLine[] = [];
  if (promoDays > 0)
    lines.push({
      label: `${promoTitle} rate`,
      days: promoDays,
      rateCents: promoRate,
      amountCents: promoDays * promoRate,
    });
  if (regularDays > 0)
    lines.push({
      label: "Daily rate",
      days: regularDays,
      rateCents: v.dailyPriceCents,
      amountCents: regularDays * v.dailyPriceCents,
    });

  const subtotalCents = lines.reduce((s, l) => s + l.amountCents, 0);
  const regularSubtotalCents = billedDays * v.dailyPriceCents;
  return {
    days,
    billedDays,
    lines,
    subtotalCents,
    regularSubtotalCents,
    savingsCents: regularSubtotalCents - subtotalCents,
    includedMiles: billedDays * v.includedMilesPerDay,
    extraMileCents: v.extraMileCents,
    depositCents: v.depositCents,
    promoTitle,
  };
}
