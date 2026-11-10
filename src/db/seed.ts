import { sql } from "drizzle-orm";
import type { DB } from "./index";
import { vehicles, promotions } from "./schema";
import { PROMO_DISCLAIMER } from "@/lib/site";
import { todayLA } from "@/lib/dates";

/**
 * Initial fleet & November promotion. Runs only when the tables are empty;
 * afterwards everything is managed from the admin dashboard.
 * Specifications are intentionally left empty — add verified specs in the dashboard.
 */
export async function seed(db: DB) {
  const [{ count }] = (await db.execute(sql`SELECT COUNT(*)::int AS count FROM vehicles`)).rows as {
    count: number;
  }[];
  if (count > 0) return;

  const inserted = await db
    .insert(vehicles)
    .values([
      {
        slug: "mercedes-maybach-gls-600",
        name: "2026 Mercedes-Maybach GLS 600",
        subtitle: "",
        category: "Ultra-Luxury SUV",
        dailyPriceCents: 69500,
        depositCents: 100000,
        includedMilesPerDay: 100,
        extraMileCents: 300,
        minDays: 1,
        description:
          "The 2026 Mercedes-Maybach GLS 600, available from VENO in Newport Beach for drives across Orange County and Los Angeles.",
        images: [],
        sortOrder: 1,
      },
      {
        slug: "bmw-m3-g80",
        name: "BMW M3",
        subtitle: "G80",
        category: "Luxury Performance Sedan",
        dailyPriceCents: 49500,
        depositCents: 100000,
        includedMilesPerDay: 100,
        extraMileCents: 300,
        minDays: 1,
        description:
          "The BMW M3 (G80), available from VENO in Newport Beach for drives across Orange County and Los Angeles.",
        images: [],
        sortOrder: 2,
      },
      {
        slug: "bmw-m4-g82",
        name: "BMW M4",
        subtitle: "G82",
        category: "Luxury Performance Coupe",
        dailyPriceCents: 49500,
        depositCents: 100000,
        includedMilesPerDay: 100,
        extraMileCents: 300,
        minDays: 1,
        description:
          "The BMW M4 (G82), available from VENO in Newport Beach for drives across Orange County and Los Angeles.",
        images: [],
        sortOrder: 3,
      },
    ])
    .returning({ id: vehicles.id, slug: vehicles.slug });

  const year = todayLA().slice(0, 4);
  const bmwIds = inserted.filter((v) => v.slug.startsWith("bmw-")).map((v) => v.id);
  await db.insert(promotions).values({
    title: "November Special",
    description: "BMW M3 & M4 — November only.",
    vehicleIds: bmwIds,
    promoDailyPriceCents: 39900,
    startsOn: `${year}-11-01`,
    endsOn: `${year}-11-30`,
    enabled: true,
    disclaimer: PROMO_DISCLAIMER,
  });
}
