export function PageTitle({ title, children, sub }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-mist">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export function Notice({ sp }: { sp: { notice?: string; error?: string } }) {
  if (sp.error) return <p className="mb-6 rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{sp.error}</p>;
  if (sp.notice) return <p className="mb-6 rounded-md border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{sp.notice}</p>;
  return null;
}

const STATUS: Record<string, string> = {
  pending: "bg-amber-400/15 text-amber-200 border-amber-400/30",
  new: "bg-amber-400/15 text-amber-200 border-amber-400/30",
  approved: "bg-emerald-400/15 text-emerald-200 border-emerald-400/30",
  reviewed: "bg-sky-400/15 text-sky-200 border-sky-400/30",
  declined: "bg-red-400/15 text-red-200 border-red-400/30",
  cancelled: "bg-white/5 text-mist border-white/15",
  archived: "bg-white/5 text-mist border-white/15",
};

export function Badge({ status }: { status: string }) {
  return <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs capitalize ${STATUS[status] ?? STATUS.archived}`}>{status}</span>;
}

export const btnPrimary = "a-btn bg-bone text-ink hover:bg-white";
export const btnGhost = "a-btn border border-white/15 text-silver hover:border-white/40 hover:text-white";
export const btnDanger = "a-btn border border-red-400/30 text-red-300 hover:bg-red-500/10";

export type SP = Promise<{ notice?: string; error?: string; status?: string }>;
