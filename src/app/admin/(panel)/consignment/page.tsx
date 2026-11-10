import { desc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { Notice, PageTitle, type SP } from "../ui";
import { InboxItem } from "../Inbox";

export default async function Consignment({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const db = await getDb();
  const rows = await db.select().from(schema.consignmentInquiries).orderBy(desc(schema.consignmentInquiries.createdAt));
  return (
    <>
      <PageTitle title="Consignment Inquiries" sub="Vehicles submitted by owners for consideration." />
      <Notice sp={sp} />
      <div className="space-y-4">
        {rows.length === 0 && <p className="text-sm text-mist">No submissions yet.</p>}
        {rows.map((r) => (
          <InboxItem key={r.id} kind="consignment" id={r.id} status={r.status} createdAt={r.createdAt}
            title={`${r.vehicleYear} ${r.vehicleMake} ${r.vehicleModel} ${r.trim} — ${r.ownerName}`}
            rows={[["Owner", r.ownerName], ["Email", r.email], ["Phone", r.phone], ["Mileage", r.mileage], ["Exterior color", r.exteriorColor], ["VIN", r.vin], ["Location", r.location], ["Photos", r.photosLink], ["Notes", r.notes]]} />
        ))}
      </div>
    </>
  );
}
