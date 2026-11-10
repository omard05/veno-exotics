import { setInboxStatus } from "../actions";
import { Badge } from "./ui";

export function InboxItem({ kind, id, status, title, createdAt, rows }: { kind: "consignment" | "brokers" | "messages"; id: number; status: string; title: string; createdAt: Date; rows: [string, string][] }) {
  return (
    <details className="a-card" open={status === "new"}>
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
        <span className="font-medium">{title}</span>
        <span className="flex items-center gap-3 text-xs text-mist">
          {createdAt.toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" })} <Badge status={status} />
        </span>
      </summary>
      <dl className="mt-4 divide-y divide-white/10 border-t border-white/10 text-sm">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="grid grid-cols-3 gap-4 py-2">
            <dt className="text-mist">{k}</dt>
            <dd className="col-span-2 whitespace-pre-wrap break-words">
              {k === "Email" ? <a href={`mailto:${v}`} className="underline">{v}</a> : k === "Phone" ? <a href={`tel:${v.replace(/[^\d+]/g, "")}`} className="underline">{v}</a> : /^https?:\/\//.test(v) ? <a href={v} target="_blank" rel="noopener noreferrer" className="underline">{v}</a> : v}
            </dd>
          </div>
        ))}
      </dl>
      <form className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={id} />
        {["new", "reviewed", "archived"].filter((s) => s !== status).map((s) => (
          <button key={s} formAction={setInboxStatus.bind(null, s)} className="a-btn border border-white/15 text-xs capitalize text-silver hover:text-white">Mark {s}</button>
        ))}
        <button formAction={setInboxStatus.bind(null, "delete")} className="a-btn border border-red-400/30 text-xs text-red-300">Delete</button>
      </form>
    </details>
  );
}
