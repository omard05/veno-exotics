import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { ArrowIcon } from "./Icons";
import { PhotoSlot } from "./PhotoSlot";
import type { CatalogVehicle } from "@/lib/catalog";

/** Prominent live-offer banner. Renders nothing once the promotion has ended. */
export function PromoStrip({ vehicles }: { vehicles: CatalogVehicle[] }) {
  const promoted = vehicles.filter((v) => v.promo);
  if (!promoted.length) return null;
  const p = promoted[0].promo!;
  const regular = Math.max(...promoted.map((v) => v.dailyPriceCents));
  return (
    <section className="relative overflow-hidden border-y border-white/15 text-white">
      <PhotoSlot slot="C5" background />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/30" />
      <Link href="/specials" className="container-x group relative flex flex-col gap-6 py-14 md:flex-row md:items-center md:justify-between md:py-20">
        <div>
          <p className="inline-block bg-white px-3 py-1.5 font-wide text-xs font-bold uppercase tracking-[0.15em] text-ink">{p.title} · Ends {formatDate(p.endsOn, { weekday: undefined, year: undefined })}</p>
          <p className="h-display mt-3 text-4xl md:text-5xl">
            {promoted.map((v) => v.name).join(" & ")}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-baseline gap-3">
            <span className="h-display text-6xl">{formatMoney(p.promoDailyPriceCents)}</span>
            <s className="text-xl text-white/60">{formatMoney(regular)}</s>
            <span className="font-wide font-semibold text-xs tracking-[0.15em]">/ DAY</span>
          </div>
          <span className="grid h-14 w-14 shrink-0 place-items-center border border-white/40 transition-colors group-hover:bg-white group-hover:text-ink">
            <ArrowIcon className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </section>
  );
}
