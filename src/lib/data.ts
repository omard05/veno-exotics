import "server-only";
import { and, asc, eq, gte, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { DEFAULT_SETTINGS, type SiteSettings } from "./site";
import { addDays, eachDate, todayLA } from "./dates";
import type { Vehicle, Promotion } from "@/db/schema";

export async function getSettings(): Promise<SiteSettings> {
  const db = await getDb();
  const rows = await db.select().from(schema.settings);
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULT_SETTINGS, ...(stored as Partial<SiteSettings>) };
}

export async function saveSettings(patch: Partial<SiteSettings>) {
  const db = await getDb();
  for (const [key, value] of Object.entries(patch)) {
    await db
      .insert(schema.settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value } });
  }
}

export async function listVehicles(opts: { includeHidden?: boolean } = {}): Promise<Vehicle[]> {
  const db = await getDb();
  const q = db.select().from(schema.vehicles);
  const rows = opts.includeHidden ? await q : await q.where(eq(schema.vehicles.published, true));
  return rows.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | undefined> {
  const db = await getDb();
  const [v] = await db.select().from(schema.vehicles).where(eq(schema.vehicles.slug, slug));
  return v;
}

export async function getVehicle(id: number): Promise<Vehicle | undefined> {
  const db = await getDb();
  const [v] = await db.select().from(schema.vehicles).where(eq(schema.vehicles.id, id));
  return v;
}

export async function listPromotions(): Promise<Promotion[]> {
  const db = await getDb();
  return db.select().from(schema.promotions).orderBy(asc(schema.promotions.startsOn));
}

/**
 * Unavailable dates for a vehicle, from today onward.
 * Only APPROVED bookings and admin-blocked ranges make a date unavailable —
 * pending requests never block the calendar.
 */
export async function unavailableDates(vehicleId: number): Promise<string[]> {
  const db = await getDb();
  const today = todayLA();
  const [bookings, blocks] = await Promise.all([
    db
      .select()
      .from(schema.bookingRequests)
      .where(
        and(
          eq(schema.bookingRequests.vehicleId, vehicleId),
          eq(schema.bookingRequests.status, "approved"),
          gte(schema.bookingRequests.returnDate, today),
        ),
      ),
    db
      .select()
      .from(schema.blockedDates)
      .where(and(eq(schema.blockedDates.vehicleId, vehicleId), gte(schema.blockedDates.endDate, today))),
  ]);
  const set = new Set<string>();
  for (const b of bookings) for (const d of eachDate(b.pickupDate, b.returnDate)) set.add(d);
  for (const b of blocks) for (const d of eachDate(b.startDate, b.endDate)) set.add(d);
  return [...set].filter((d) => d >= today).sort();
}

/** Returns the first conflicting date for a requested range, if any. */
export async function findConflict(
  vehicleId: number,
  startDate: string,
  endDate: string,
  excludeBookingId?: number,
): Promise<string | undefined> {
  const db = await getDb();
  const [bookings, blocks] = await Promise.all([
    db
      .select()
      .from(schema.bookingRequests)
      .where(
        and(eq(schema.bookingRequests.vehicleId, vehicleId), eq(schema.bookingRequests.status, "approved")),
      ),
    db.select().from(schema.blockedDates).where(eq(schema.blockedDates.vehicleId, vehicleId)),
  ]);
  const taken = new Set<string>();
  for (const b of bookings)
    if (b.id !== excludeBookingId) for (const d of eachDate(b.pickupDate, b.returnDate)) taken.add(d);
  for (const b of blocks) for (const d of eachDate(b.startDate, b.endDate)) taken.add(d);
  return eachDate(startDate, endDate).find((d) => taken.has(d));
}

export async function vehiclesById(ids: number[]) {
  if (!ids.length) return [];
  const db = await getDb();
  return db.select().from(schema.vehicles).where(inArray(schema.vehicles.id, ids));
}

export { addDays };
