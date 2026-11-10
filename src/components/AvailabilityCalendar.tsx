"use client";

import { useMemo, useState } from "react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function ym(date: string) {
  return { y: Number(date.slice(0, 4)), m: Number(date.slice(5, 7)) - 1 };
}
function iso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/**
 * Month calendar showing unavailable dates (approved bookings + admin blocks).
 * When `onPick` is provided the calendar is interactive: first click = pickup, second = return.
 */
export function AvailabilityCalendar({
  today,
  unavailable,
  start,
  end,
  onPick,
  months = 2,
}: {
  today: string;
  unavailable: string[];
  start?: string;
  end?: string;
  onPick?: (date: string) => void;
  months?: number;
}) {
  const taken = useMemo(() => new Set(unavailable), [unavailable]);
  const [offset, setOffset] = useState(0);
  const base = ym(today);

  const grids = Array.from({ length: months }, (_, k) => {
    const mi = base.m + offset + k;
    const y = base.y + Math.floor(mi / 12);
    const m = ((mi % 12) + 12) % 12;
    const first = new Date(Date.UTC(y, m, 1)).getUTCDay();
    const daysIn = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const cells: (string | null)[] = [...Array(first).fill(null), ...Array.from({ length: daysIn }, (_, i) => iso(y, m, i + 1))];
    const label = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
      new Date(Date.UTC(y, m, 1)),
    );
    return { label, cells };
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOffset((o) => Math.max(0, o - 1))}
          disabled={offset === 0}
          className="px-3 py-1 font-wide text-[10px] tracking-[0.3em] text-silver hover:text-white disabled:opacity-20"
          aria-label="Previous month"
        >
          ←
        </button>
        <div className="flex gap-5 text-[10px] text-mist">
          <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 border border-white/40" /> Available</span>
          <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 bg-white/10 [background-image:linear-gradient(135deg,transparent_45%,rgba(255,255,255,.35)_45%,rgba(255,255,255,.35)_55%,transparent_55%)]" /> Booked</span>
        </div>
        <button
          type="button"
          onClick={() => setOffset((o) => Math.min(18, o + 1))}
          className="px-3 py-1 font-wide text-[10px] tracking-[0.3em] text-silver hover:text-white"
          aria-label="Next month"
        >
          →
        </button>
      </div>
      <div className={`grid gap-8 ${months > 1 ? "sm:grid-cols-2" : ""}`}>
        {grids.map((g, gi) => (
          <div key={g.label} className={gi > 0 ? "hidden sm:block" : ""}>
            <p className="mb-3 text-center font-wide text-[10px] tracking-[0.3em]">{g.label.toUpperCase()}</p>
            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map((w) => (
                <span key={w} className="py-1 text-[10px] text-mist">{w}</span>
              ))}
              {g.cells.map((d, i) => {
                if (!d) return <span key={i} />;
                const past = d < today;
                const booked = taken.has(d);
                const selected = d === start || d === end;
                const inRange = start && end && d > start && d < end;
                const disabled = past || booked;
                const cls = [
                  "aspect-square text-xs transition-colors",
                  past ? "text-white/15" : "",
                  booked
                    ? "text-white/30 line-through bg-white/5 [background-image:linear-gradient(135deg,transparent_47%,rgba(255,255,255,.18)_47%,rgba(255,255,255,.18)_53%,transparent_53%)]"
                    : "",
                  selected ? "bg-white text-ink font-semibold" : "",
                  inRange && !booked ? "bg-white/15" : "",
                  !disabled && !selected && onPick ? "hover:bg-white/20" : "",
                ].join(" ");
                return onPick ? (
                  <button
                    key={d}
                    type="button"
                    disabled={disabled}
                    onClick={() => onPick(d)}
                    className={cls}
                    aria-label={`${d}${booked ? " (unavailable)" : ""}`}
                  >
                    {Number(d.slice(8))}
                  </button>
                ) : (
                  <span key={d} className={`grid place-items-center ${cls}`} aria-label={`${d}${booked ? " (unavailable)" : ""}`}>
                    {Number(d.slice(8))}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
