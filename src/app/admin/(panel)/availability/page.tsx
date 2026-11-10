import Link from "next/link";
import { and, eq, gte } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { listVehicles } from "@/lib/data";
import { formatDate, todayLA } from "@/lib/dates";
import { addBlock, removeBlock } from "../../actions";
import { Notice, PageTitle, btnPrimary, type SP } from "../ui";

export default async function Availability({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const today = todayLA();
  const db = await getDb();
  const [vehicles, blocks, bookings] = await Promise.all([
    listVehicles({ includeHidden: true }),
    db.select().from(schema.blockedDates).where(gte(schema.blockedDates.endDate, today)),
    db.select().from(schema.bookingRequests).where(and(eq(schema.bookingRequests.status, "approved"), gte(schema.bookingRequests.returnDate, today))),
  ]);

  return (
    <>
      <PageTitle title="Availability" sub="Dates become unavailable on the website only when you approve a request or block them here." />
      <Notice sp={sp} />
      <section className="a-card mb-6">
        <h2 className="mb-4 font-medium">Block dates</h2>
        <form action={addBlock} className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1"><label className="a-label">Vehicle</label>
            <select name="vehicleId" required className="a-input">{vehicles.map((v) => <option key={v.id} value={v.id}>{v.name} {v.subtitle}</option>)}</select>
          </div>
          <div><label className="a-label">From</label><input type="date" name="startDate" min={today} required className="a-input" /></div>
          <div><label className="a-label">To (inclusive)</label><input type="date" name="endDate" min={today} className="a-input" /></div>
          <div><label className="a-label">Reason (internal)</label><input name="reason" className="a-input" placeholder="Maintenance, offline booking…" /></div>
          <button className={btnPrimary}>Block dates</button>
        </form>
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        {vehicles.map((v) => {
          const vb = blocks.filter((b) => b.vehicleId === v.id).sort((a, b) => a.startDate.localeCompare(b.startDate));
          const vk = bookings.filter((b) => b.vehicleId === v.id).sort((a, b) => a.pickupDate.localeCompare(b.pickupDate));
          return (
            <section key={v.id} className="a-card">
              <h2 className="mb-4 font-medium">{v.name} {v.subtitle}</h2>
              <h3 className="mb-2 text-xs uppercase tracking-wider text-mist">Approved bookings</h3>
              {vk.length === 0 ? <p className="mb-4 text-sm text-mist">None upcoming.</p> : (
                <ul className="mb-4 divide-y divide-white/10 text-sm">
                  {vk.map((b) => <li key={b.id} className="flex justify-between py-2"><span>{formatDate(b.pickupDate)} – {formatDate(b.returnDate)}</span><Link href={`/admin/requests/${b.id}`} className="text-silver underline">{b.fullName}</Link></li>)}
                </ul>
              )}
              <h3 className="mb-2 text-xs uppercase tracking-wider text-mist">Blocked dates</h3>
              {vb.length === 0 ? <p className="text-sm text-mist">None.</p> : (
                <ul className="divide-y divide-white/10 text-sm">
                  {vb.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-3 py-2">
                      <span>{formatDate(b.startDate)} – {formatDate(b.endDate)} {b.reason && <span className="text-mist">· {b.reason}</span>}</span>
                      <form action={removeBlock}><input type="hidden" name="id" value={b.id} /><button className="text-xs text-red-300 hover:underline">Reopen</button></form>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
