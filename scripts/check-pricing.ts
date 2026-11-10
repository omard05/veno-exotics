/**
 * Sanity checks for pricing and promotion expiry. Run: npm run check:pricing
 */
import assert from "node:assert/strict";
import { estimate, isPromoLive, livePromoFor } from "../src/lib/pricing";
import { todayLA } from "../src/lib/dates";

const m4 = { id: 3, dailyPriceCents: 49500, depositCents: 100000, includedMilesPerDay: 100, extraMileCents: 300, minDays: 1 };
const maybach = { ...m4, id: 1, dailyPriceCents: 69500 };
const nov = { id: 1, title: "November Special", vehicleIds: [2, 3], promoDailyPriceCents: 39900, startsOn: "2026-11-01", endsOn: "2026-11-30", enabled: true };

// Live only during November (Newport Beach time)
assert.equal(isPromoLive(nov, "2026-10-31"), false);
assert.equal(isPromoLive(nov, "2026-11-01"), true);
assert.equal(isPromoLive(nov, "2026-11-30"), true);
assert.equal(isPromoLive(nov, "2026-12-01"), false, "promo must expire after November");
assert.equal(isPromoLive({ ...nov, enabled: false }, "2026-11-15"), false);

// Expiry uses Pacific time: 11:30pm Nov 30 PT is already Dec 1 in UTC
assert.equal(todayLA(new Date("2026-12-01T07:30:00Z")), "2026-11-30");
assert.equal(todayLA(new Date("2026-12-01T08:00:00Z")), "2026-12-01");

// Maybach is never discounted
assert.equal(livePromoFor(maybach.id, [nov], "2026-11-15"), undefined);
assert.equal(estimate(maybach, [nov], "2026-11-10", "10:00", "2026-11-12", "10:00", "2026-11-10")!.subtotalCents, 2 * 69500);

// Full November rental at promo price
const e1 = estimate(m4, [nov], "2026-11-20", "10:00", "2026-11-23", "10:00", "2026-11-10")!;
assert.equal(e1.billedDays, 3);
assert.equal(e1.subtotalCents, 3 * 39900);
assert.equal(e1.includedMiles, 300);

// Rental spanning Nov → Dec: November days at promo, December days at regular
const e2 = estimate(m4, [nov], "2026-11-29", "10:00", "2026-12-02", "10:00", "2026-11-10")!;
assert.equal(e2.subtotalCents, 2 * 39900 + 1 * 49500);

// After November ends, no promo pricing at all
const e3 = estimate(m4, [nov], "2026-12-05", "10:00", "2026-12-06", "10:00", "2026-12-01")!;
assert.equal(e3.subtotalCents, 49500);
assert.equal(e3.promoTitle, undefined);

// Partial days round up; a few minutes over starts a new day
assert.equal(estimate(m4, [], "2026-12-05", "10:00", "2026-12-06", "10:30", "2026-12-01")!.billedDays, 2);
// Same-day short rental bills the 1-day minimum
assert.equal(estimate(m4, [], "2026-12-05", "10:00", "2026-12-05", "18:00", "2026-12-01")!.billedDays, 1);
assert.equal(estimate(m4, [], "2026-12-05", "10:00", "2026-12-05", "09:00", "2026-12-01"), null);

console.log("✓ pricing & promotion checks passed");
