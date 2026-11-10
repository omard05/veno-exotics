import { desc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { Notice, PageTitle, type SP } from "../ui";
import { InboxItem } from "../Inbox";

export default async function Messages({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const db = await getDb();
  const rows = await db.select().from(schema.contactMessages).orderBy(desc(schema.contactMessages.createdAt));
  return (
    <>
      <PageTitle title="Messages" sub="Submitted through the Contact page." />
      <Notice sp={sp} />
      <div className="space-y-4">
        {rows.length === 0 && <p className="text-sm text-mist">No messages yet.</p>}
        {rows.map((r) => (
          <InboxItem key={r.id} kind="messages" id={r.id} status={r.status} createdAt={r.createdAt}
            title={r.fullName} rows={[["Email", r.email], ["Phone", r.phone], ["Message", r.message]]} />
        ))}
      </div>
    </>
  );
}
