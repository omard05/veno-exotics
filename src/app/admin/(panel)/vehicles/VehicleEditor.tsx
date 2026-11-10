import Link from "next/link";
import type { Vehicle } from "@/db/schema";
import { saveVehicle, deleteVehicle } from "../../actions";
import { btnDanger, btnPrimary } from "../ui";

const dollars = (c?: number) => (c === undefined ? "" : (c / 100).toFixed(c % 100 ? 2 : 0));

export function VehicleEditor({ v }: { v?: Vehicle }) {
  return (
    <>
      <form action={saveVehicle} className="grid gap-6 xl:grid-cols-3">
        {v && <input type="hidden" name="id" value={v.id} />}
        <section className="a-card space-y-4 xl:col-span-2">
          <h2 className="font-medium">Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="a-label">Display name *</label><input name="name" required defaultValue={v?.name} className="a-input" placeholder="e.g. BMW M4" /></div>
            <div><label className="a-label">Subtitle / generation</label><input name="subtitle" defaultValue={v?.subtitle} className="a-input" placeholder="e.g. G82" /></div>
            <div><label className="a-label">Category</label><input name="category" defaultValue={v?.category} className="a-input" placeholder="e.g. Luxury Performance Coupe" /></div>
            <div><label className="a-label">URL slug</label><input name="slug" defaultValue={v?.slug} className="a-input" placeholder="auto-generated from name" /></div>
          </div>
          <div><label className="a-label">Description</label><textarea name="description" rows={4} defaultValue={v?.description} className="a-input" /></div>
          <div>
            <label className="a-label">Specifications (optional, one per line as Label: Value)</label>
            <textarea name="specs" rows={5} defaultValue={v?.specs.map((s) => `${s.label}: ${s.value}`).join("\n")} className="a-input font-mono text-xs" placeholder={"Seats: 4\nColor: …"} />
            <p className="mt-1 text-xs text-mist">Only enter verified specifications. Leave empty to hide the specifications section.</p>
          </div>
          <div>
            <label className="a-label">Photos (one image URL per line — the first is the main photo)</label>
            <textarea name="images" rows={5} defaultValue={v?.images.join("\n")} className="a-input font-mono text-xs" placeholder={"/images/fleet/m4-front.jpg\nhttps://…"} />
            <p className="mt-1 text-xs text-mist">Use full image links (https://…) or files added to the repository under <code>public/images/fleet/</code> (e.g. <code>/images/fleet/m4.jpg</code>). Wide, high-resolution landscape photos look best.</p>
          </div>
        </section>
        <section className="a-card space-y-4">
          <h2 className="font-medium">Pricing & terms</h2>
          <div><label className="a-label">Daily price ($) *</label><input name="dailyPrice" required inputMode="decimal" defaultValue={dollars(v?.dailyPriceCents)} className="a-input" /></div>
          <div><label className="a-label">Security deposit ($)</label><input name="deposit" inputMode="decimal" defaultValue={dollars(v?.depositCents ?? 100000)} className="a-input" /></div>
          <div><label className="a-label">Included miles per rental day</label><input name="includedMilesPerDay" inputMode="numeric" defaultValue={v?.includedMilesPerDay ?? 100} className="a-input" /></div>
          <div><label className="a-label">Additional mileage ($ per mile)</label><input name="extraMile" inputMode="decimal" defaultValue={dollars(v?.extraMileCents ?? 300)} className="a-input" /></div>
          <div><label className="a-label">Minimum rental (days)</label><input name="minDays" inputMode="numeric" defaultValue={v?.minDays ?? 1} className="a-input" /></div>
          <div><label className="a-label">Display order</label><input name="sortOrder" inputMode="numeric" defaultValue={v?.sortOrder ?? 0} className="a-input" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={v?.published ?? true} className="accent-white" /> Show on website</label>
          <p className="text-xs text-mist">Promotional prices are managed under <Link href="/admin/promotions" className="underline">Promotions</Link>.</p>
          <button className={`${btnPrimary} w-full`}>{v ? "Save changes" : "Create vehicle"}</button>
        </section>
      </form>
      {v && (
        <form action={deleteVehicle} className="mt-6">
          <input type="hidden" name="id" value={v.id} />
          <button className={btnDanger}>Delete vehicle</button>
          <span className="ml-3 text-xs text-mist">Tip: uncheck “Show on website” to hide a vehicle without deleting it.</span>
        </form>
      )}
    </>
  );
}
