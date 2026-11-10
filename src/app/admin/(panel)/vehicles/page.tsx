import Link from "next/link";
import { listVehicles } from "@/lib/data";
import { formatMoney } from "@/lib/money";
import { Badge, Notice, PageTitle, btnPrimary, type SP } from "../ui";

export default async function Vehicles({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const vehicles = await listVehicles({ includeHidden: true });
  return (
    <>
      <PageTitle title="Vehicles & Pricing" sub="Add vehicles, change prices, upload photos and hide or show vehicles on the site.">
        <Link href="/admin/vehicles/new" className={btnPrimary}>Add vehicle</Link>
      </PageTitle>
      <Notice sp={sp} />
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-graphite text-left text-xs text-mist">
            <tr>{["Vehicle", "Category", "Daily", "Deposit", "Miles/day", "Extra mile", "Status", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td className="px-4 py-3 font-medium">{v.name} <span className="text-mist">{v.subtitle}</span></td>
                <td className="px-4 py-3 text-silver">{v.category}</td>
                <td className="px-4 py-3">{formatMoney(v.dailyPriceCents)}</td>
                <td className="px-4 py-3">{formatMoney(v.depositCents)}</td>
                <td className="px-4 py-3">{v.includedMilesPerDay}</td>
                <td className="px-4 py-3">{formatMoney(v.extraMileCents)}</td>
                <td className="px-4 py-3"><Badge status={v.published ? "approved" : "archived"} /> <span className="text-xs text-mist">{v.published ? "Live" : "Hidden"}</span></td>
                <td className="px-4 py-3 text-right"><Link href={`/admin/vehicles/${v.id}`} className="underline">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
