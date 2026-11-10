import { desc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { Notice, PageTitle, type SP } from "../ui";
import { InboxItem } from "../Inbox";

export default async function Brokers({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const db = await getDb();
  const rows = await db.select().from(schema.brokerApplications).orderBy(desc(schema.brokerApplications.createdAt));
  return (
    <>
      <PageTitle title="Broker Applications" sub="People applying to become VENO referral partners." />
      <Notice sp={sp} />
      <div className="space-y-4">
        {rows.length === 0 && <p className="text-sm text-mist">No applications yet.</p>}
        {rows.map((r) => (
          <InboxItem key={r.id} kind="brokers" id={r.id} status={r.status} createdAt={r.createdAt}
            title={`${r.fullName}${r.company ? ` · ${r.company}` : ""}`}
            rows={[["Email", r.email], ["Phone", r.phone], ["Company", r.company], ["Social", r.social], ["Location", r.location], ["Network", r.network], ["Notes", r.notes]]} />
        ))}
      </div>
    </>
  );
}
