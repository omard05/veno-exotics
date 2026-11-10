import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { ArrowIcon } from "./Icons";
import type { CatalogVehicle } from "@/lib/catalog";

/** Prominent live-offer banner. Renders nothing once the promotion has ended. */
export function PromoStrip({ vehicles }: { vehicles: CatalogVehicle[] }) {
  const promoted = vehicles.filter((v) => v.promo);
  if (!promoted.length) return null;
  const p = promoted[0].promo!;
  const regular = Math.max(...promoted.map((v) => v.dailyPriceCents));
  return (
    <section className="bg-bone text-ink">
      <Link href="/specials" className="container-x group flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-wide text-[10px] font-bold tracking-[0.35em] uppercase">{p.title} · Ends {formatDate(p.endsOn, { weekday: undefined, year: undefined })}</p>
          <p className="h-display mt-3 text-4xl md:text-5xl">
            {promoted.map((v) => v.name).join(" & ")}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-baseline gap-3">
            <span className="h-display text-6xl">{formatMoney(p.promoDailyPriceCents)}</span>
            <s className="text-xl text-black/50">{formatMoney(regular)}</s>
            <span className="font-wide text-[10px] tracking-[0.3em]">/ DAY</span>
          </div>
          <span className="grid h-14 w-14 shrink-0 place-items-center border border-black/30 transition-colors group-hover:bg-ink group-hover:text-white">
            <ArrowIcon className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </section>
  );
}
