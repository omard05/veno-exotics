import { listPromotions, listVehicles } from "@/lib/data";
import { isPromoLive } from "@/lib/pricing";
import { formatDate, todayLA } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { PROMO_DISCLAIMER } from "@/lib/site";
import type { Promotion, Vehicle } from "@/db/schema";
import { savePromotion, deletePromotion } from "../../actions";
import { Badge, Notice, PageTitle, btnDanger, btnPrimary, type SP } from "../ui";

function PromoForm({ p, vehicles }: { p?: Promotion; vehicles: Vehicle[] }) {
  return (
    <form action={savePromotion} className="space-y-4">
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="a-label">Title *</label><input name="title" required defaultValue={p?.title} className="a-input" placeholder="November Special" /></div>
        <div><label className="a-label">Promotional daily price ($) *</label><input name="promoPrice" required inputMode="decimal" defaultValue={p ? String(p.promoDailyPriceCents / 100) : ""} className="a-input" /></div>
        <div><label className="a-label">Starts (first day) *</label><input type="date" name="startsOn" required defaultValue={p?.startsOn} className="a-input" /></div>
        <div><label className="a-label">Ends (last day) *</label><input type="date" name="endsOn" required defaultValue={p?.endsOn} className="a-input" /></div>
      </div>
      <div><label className="a-label">Short description</label><input name="description" defaultValue={p?.description} className="a-input" /></div>
      <fieldset>
        <legend className="a-label">Applies to *</legend>
        <div className="flex flex-wrap gap-4">
          {vehicles.map((v) => (
            <label key={v.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="vehicleIds" value={v.id} defaultChecked={p?.vehicleIds.includes(v.id)} className="accent-white" />
              {v.name} {v.subtitle} <span className="text-mist">({formatMoney(v.dailyPriceCents)})</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div><label className="a-label">Disclaimer</label><textarea name="disclaimer" rows={3} defaultValue={p?.disclaimer ?? PROMO_DISCLAIMER} className="a-input" /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="enabled" defaultChecked={p?.enabled ?? true} className="accent-white" /> Enabled</label>
      <button className={btnPrimary}>{p ? "Save promotion" : "Create promotion"}</button>
    </form>
  );
}

export default async function Promotions({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [promos, vehicles] = await Promise.all([listPromotions(), listVehicles({ includeHidden: true })]);
  const today = todayLA();
  return (
    <>
      <PageTitle title="Promotions" sub="Promotions appear on the site only between their start and end dates (Newport Beach time) and disappear automatically once they end." />
      <Notice sp={sp} />
      <div className="space-y-6">
        {promos.map((p) => {
          const live = isPromoLive(p, today);
          const status = live ? "Live now" : !p.enabled ? "Disabled" : p.endsOn < today ? "Ended" : "Scheduled";
          return (
            <details key={p.id} className="a-card" open={live}>
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
                <span className="font-medium">{p.title} · {formatMoney(p.promoDailyPriceCents)}/day</span>
                <span className="flex items-center gap-3 text-xs text-mist">
                  {formatDate(p.startsOn)} – {formatDate(p.endsOn)}
                  <Badge status={live ? "approved" : status === "Scheduled" ? "reviewed" : "archived"} /> {status}
                </span>
              </summary>
              <div className="mt-6 border-t border-white/10 pt-6">
                <PromoForm p={p} vehicles={vehicles} />
                <form action={deletePromotion} className="mt-4">
                  <input type="hidden" name="id" value={p.id} />
                  <button className={btnDanger}>Delete</button>
                </form>
              </div>
            </details>
          );
        })}
        <section className="a-card">
          <h2 className="mb-4 font-medium">New promotion</h2>
          <PromoForm vehicles={vehicles} />
        </section>
      </div>
    </>
  );
}
