import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { formatDate, formatTime } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { Badge, Notice, PageTitle, type SP } from "../ui";

const TABS = ["pending", "approved", "declined", "cancelled", "all"] as const;

export default async function Requests({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const status = (TABS as readonly string[]).includes(sp.status ?? "") ? sp.status! : "pending";
  const db = await getDb();
  const q = db.select().from(schema.bookingRequests);
  const rows = await (status === "all" ? q : q.where(eq(schema.bookingRequests.status, status as "pending"))).orderBy(desc(schema.bookingRequests.createdAt));

  return (
    <>
      <PageTitle title="Booking Requests" sub="Reservations are never confirmed automatically. Dates are only marked booked after you approve." />
      <Notice sp={sp} />
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link key={t} href={`/admin/requests?status=${t}`} className={`rounded-full px-3 py-1 text-sm capitalize ${status === t ? "bg-bone text-ink" : "border border-white/15 text-silver hover:text-white"}`}>{t}</Link>
        ))}
      </div>
      {rows.length === 0 ? <p className="text-sm text-mist">No {status === "all" ? "" : status} requests.</p> : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-graphite text-left text-xs text-mist">
              <tr>{["Ref", "Customer", "Vehicle", "Pickup", "Return", "Estimate", "Status", "Received"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3"><Link href={`/admin/requests/${b.id}`} className="underline">VENO-{String(b.id).padStart(5, "0")}</Link></td>
                  <td className="px-4 py-3"><span className="block">{b.fullName}</span><span className="text-xs text-mist">{b.phone}</span></td>
                  <td className="px-4 py-3">{b.vehicleName}</td>
                  <td className="px-4 py-3">{formatDate(b.pickupDate)}<br /><span className="text-xs text-mist">{formatTime(b.pickupTime)}</span></td>
                  <td className="px-4 py-3">{formatDate(b.returnDate)}<br /><span className="text-xs text-mist">{formatTime(b.returnTime)}</span></td>
                  <td className="px-4 py-3">{formatMoney(b.estimateCents)}</td>
                  <td className="px-4 py-3"><Badge status={b.status} /></td>
                  <td className="px-4 py-3 text-xs text-mist">{b.createdAt.toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
