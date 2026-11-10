import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getCatalog } from "@/lib/catalog";
import { formatDate, formatTime } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { Badge, PageTitle } from "./ui";

async function count(table: typeof schema.consignmentInquiries | typeof schema.brokerApplications | typeof schema.contactMessages) {
  const db = await getDb();
  const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(table).where(eq(table.status, "new"));
  return r.n;
}

export default async function Overview() {
  const db = await getDb();
  const [pending, { vehicles, livePromos, today }, nConsign, nBroker, nMsg] = await Promise.all([
    db.select().from(schema.bookingRequests).where(eq(schema.bookingRequests.status, "pending")).orderBy(desc(schema.bookingRequests.createdAt)),
    getCatalog(),
    count(schema.consignmentInquiries),
    count(schema.brokerApplications),
    count(schema.contactMessages),
  ]);
  const upcoming = (await db.select().from(schema.bookingRequests).where(eq(schema.bookingRequests.status, "approved")))
    .filter((b) => b.returnDate >= today)
    .sort((a, b) => a.pickupDate.localeCompare(b.pickupDate))
    .slice(0, 8);

  const tiles = [
    ["Pending requests", pending.length, "/admin/requests?status=pending"],
    ["Upcoming rentals", upcoming.length, "/admin/requests?status=approved"],
    ["New consignment", nConsign, "/admin/consignment"],
    ["New broker apps", nBroker, "/admin/brokers"],
    ["New messages", nMsg, "/admin/messages"],
  ] as const;

  return (
    <>
      <PageTitle title="Overview" sub={`Today in Newport Beach: ${formatDate(today)}`} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {tiles.map(([label, n, href]) => (
          <Link key={label} href={href} className="a-card hover:border-white/30">
            <p className="text-xs text-mist">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{n}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="a-card">
          <h2 className="mb-4 font-medium">Awaiting your decision</h2>
          {pending.length === 0 ? <p className="text-sm text-mist">No pending requests.</p> : (
            <ul className="divide-y divide-white/10">
              {pending.map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/requests/${b.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-white">
                    <span>
                      <span className="block text-sm font-medium">{b.fullName} · {b.vehicleName}</span>
                      <span className="text-xs text-mist">{formatDate(b.pickupDate)} {formatTime(b.pickupTime)} → {formatDate(b.returnDate)} {formatTime(b.returnTime)}</span>
                    </span>
                    <span className="text-sm">{formatMoney(b.estimateCents)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="a-card">
          <h2 className="mb-4 font-medium">Upcoming approved rentals</h2>
          {upcoming.length === 0 ? <p className="text-sm text-mist">None scheduled.</p> : (
            <ul className="divide-y divide-white/10">
              {upcoming.map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/requests/${b.id}`} className="flex items-center justify-between gap-4 py-3">
                    <span className="text-sm">{b.vehicleName} · {b.fullName}</span>
                    <span className="text-xs text-mist">{formatDate(b.pickupDate, { year: undefined })} – {formatDate(b.returnDate, { year: undefined })}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="a-card">
          <h2 className="mb-4 font-medium">Fleet & live pricing</h2>
          <ul className="divide-y divide-white/10 text-sm">
            {vehicles.map((v) => (
              <li key={v.id} className="flex justify-between py-2.5">
                <Link href={`/admin/vehicles/${v.id}`} className="hover:underline">{v.name} {v.subtitle}</Link>
                <span>{v.promo ? <><s className="text-mist">{formatMoney(v.dailyPriceCents)}</s> {formatMoney(v.promo.promoDailyPriceCents)}</> : formatMoney(v.dailyPriceCents)}/day</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="a-card">
          <h2 className="mb-4 font-medium">Live promotions</h2>
          {livePromos.length === 0 ? <p className="text-sm text-mist">No promotions are live today.</p> : livePromos.map((p) => (
            <p key={p.id} className="text-sm">{p.title} — {formatMoney(p.promoDailyPriceCents)}/day, ends {formatDate(p.endsOn)} <Badge status="approved" /></p>
          ))}
          <Link href="/admin/promotions" className="mt-4 inline-block text-xs text-silver underline">Manage promotions</Link>
        </section>
      </div>
    </>
  );
}
