import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { findConflict } from "@/lib/data";
import { formatDate, formatTime } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { Estimate } from "@/lib/pricing";
import { decideBooking, deleteBooking } from "../../../actions";
import { Badge, Notice, PageTitle, btnDanger, btnGhost, btnPrimary, type SP } from "../../ui";

export default async function RequestDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const db = await getDb();
  const [b] = await db.select().from(schema.bookingRequests).where(eq(schema.bookingRequests.id, Number(id)));
  if (!b) notFound();
  const est = b.estimate as Estimate;
  const conflict = b.status === "pending" ? await findConflict(b.vehicleId, b.pickupDate, b.returnDate, b.id) : undefined;
  const ref = `VENO-${String(b.id).padStart(5, "0")}`;

  const rows: [string, React.ReactNode][] = [
    ["Vehicle", b.vehicleName],
    ["Pickup", `${formatDate(b.pickupDate)} at ${formatTime(b.pickupTime)}`],
    ["Return", `${formatDate(b.returnDate)} at ${formatTime(b.returnTime)}`],
    ["Rental days", est.billedDays],
    ["Customer", b.fullName],
    ["Email", <a key="e" href={`mailto:${b.email}?subject=${encodeURIComponent(`Your VENO reservation request ${ref}`)}`} className="underline">{b.email}</a>],
    ["Phone", <a key="p" href={`tel:${b.phone.replace(/[^\d+]/g, "")}`} className="underline">{b.phone}</a>],
    ["Notes", b.notes || "—"],
    ["Received", b.createdAt.toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "full", timeStyle: "short" })],
  ];

  return (
    <>
      <Link href="/admin/requests" className="text-sm text-mist hover:text-white">← All requests</Link>
      <div className="mt-4"><PageTitle title={ref}><Badge status={b.status} /></PageTitle></div>
      <Notice sp={sp} />
      {conflict && <p className="mb-6 rounded-md border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">Heads up: this vehicle is already booked or blocked on {formatDate(conflict)}. Approval is disabled until that is resolved.</p>}

      <div className="grid gap-6 xl:grid-cols-5">
        <section className="a-card xl:col-span-3">
          <dl className="divide-y divide-white/10 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-4 py-3"><dt className="text-mist">{k}</dt><dd className="col-span-2 whitespace-pre-wrap break-words">{v}</dd></div>
            ))}
          </dl>
          <h3 className="mt-8 mb-2 text-sm font-medium">Estimate at time of request</h3>
          <dl className="divide-y divide-white/10 rounded-lg border border-white/10 text-sm">
            {est.lines.map((l) => <div key={l.label} className="flex justify-between px-4 py-2"><dt>{l.label} · {l.days} × {formatMoney(l.rateCents)}</dt><dd>{formatMoney(l.amountCents)}</dd></div>)}
            <div className="flex justify-between px-4 py-2 font-semibold"><dt>Estimated rental</dt><dd>{formatMoney(est.subtotalCents)}</dd></div>
            <div className="flex justify-between px-4 py-2 text-mist"><dt>Included miles</dt><dd>{est.includedMiles} (then {formatMoney(est.extraMileCents)}/mi)</dd></div>
            <div className="flex justify-between px-4 py-2 text-mist"><dt>Security deposit</dt><dd>{formatMoney(est.depositCents)}</dd></div>
          </dl>
        </section>

        <section className="a-card xl:col-span-2">
          <h2 className="mb-4 font-medium">Decision</h2>
          <form className="space-y-4">
            <input type="hidden" name="id" value={b.id} />
            <div>
              <label className="a-label" htmlFor="note">Message to customer (optional)</label>
              <textarea id="note" name="adminNote" rows={4} defaultValue={b.adminNote} className="a-input" placeholder="Included in the email if you notify the customer" />
            </div>
            <label className="flex items-center gap-2 text-sm text-silver">
              <input type="checkbox" name="notify" defaultChecked className="accent-white" /> Email the customer about this decision
            </label>
            <div className="flex flex-wrap gap-2 pt-2">
              {b.status !== "approved" && <button formAction={decideBooking.bind(null, "approved")} value="approved" disabled={!!conflict} className={btnPrimary}>Approve</button>}
              {b.status === "pending" && <button formAction={decideBooking.bind(null, "declined")} value="declined" className={btnDanger}>Decline</button>}
              {b.status === "approved" && <button formAction={decideBooking.bind(null, "cancelled")} value="cancelled" className={btnDanger}>Cancel booking</button>}
              {b.status !== "pending" && <button formAction={decideBooking.bind(null, "pending")} value="pending" className={btnGhost}>Move back to pending</button>}
            </div>
            <p className="text-xs text-mist">Approving marks {formatDate(b.pickupDate, { weekday: undefined })} – {formatDate(b.returnDate, { weekday: undefined })} as booked on the public calendar. Declining or cancelling keeps the dates open.</p>
          </form>
          <form action={deleteBooking} className="mt-8 border-t border-white/10 pt-4">
            <input type="hidden" name="id" value={b.id} />
            <button className="text-xs text-red-300 hover:underline">Delete this request permanently</button>
          </form>
        </section>
      </div>
    </>
  );
}
