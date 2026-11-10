import "server-only";
import { listPromotions, listVehicles } from "./data";
import { isPromoLive, livePromoFor } from "./pricing";
import { todayLA } from "./dates";
import type { Promotion, Vehicle } from "@/db/schema";

export type CatalogVehicle = Vehicle & { promo?: Promotion };

/** Published vehicles with today's live promotion attached. Expired promos are never returned. */
export async function getCatalog() {
  const today = todayLA();
  const [vehicles, promos] = await Promise.all([listVehicles(), listPromotions()]);
  const live = promos.filter((p) => isPromoLive(p, today));
  const catalog: CatalogVehicle[] = vehicles.map((v) => {
    const p = livePromoFor(v.id, live, today);
    return { ...v, promo: p && p.promoDailyPriceCents < v.dailyPriceCents ? (p as Promotion) : undefined };
  });
  return { vehicles: catalog, livePromos: live, today };
}
