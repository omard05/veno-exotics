import Link from "next/link";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { PageHero } from "@/components/PageHero";
import { VehicleImage } from "@/components/VehicleImage";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { ArrowIcon } from "@/components/Icons";

export const metadata: Metadata = { title: "Specials" };

export default async function Specials() {
  const { vehicles, livePromos } = await getCatalog();
  const shown = livePromos.filter((p) => vehicles.some((v) => v.promo?.id === p.id));

  return (
    <>
      <PageHero
        eyebrow="Specials"
        title={shown.length ? <>Limited-time <em className="italic">offers.</em></> : "Specials"}
      />
      <section className="container-x py-20 md:py-28">
        {shown.length === 0 && (
          <div className="max-w-2xl">
            <p className="h-display text-4xl">There are no active specials right now.</p>
            <p className="mt-4 text-silver">Follow @veno.exotics for upcoming offers, or explore the fleet at our standard rates.</p>
            <Link href="/fleet" className="btn-ghost mt-10">View the Fleet</Link>
          </div>
        )}

        {shown.map((p) => {
          const promoted = vehicles.filter((v) => v.promo?.id === p.id);
          return (
            <div key={p.id} className="mb-24 last:mb-0">
              <div className="mb-12 flex flex-col gap-4 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="eyebrow !text-white">
                    {formatDate(p.startsOn, { weekday: undefined })} – {formatDate(p.endsOn, { weekday: undefined })}
                  </p>
                  <h2 className="h-display mt-4 text-5xl md:text-7xl">{p.title}</h2>
                  {p.description && <p className="mt-4 text-lg text-silver">{p.description}</p>}
                </div>
                <p className="text-sm text-mist">Offer ends {formatDate(p.endsOn)}.</p>
              </div>

              <div className="grid gap-12 md:grid-cols-2">
                {promoted.map((v) => (
                  <Link key={v.id} href={`/fleet/${v.slug}`} className="group block">
                    <VehicleImage src={v.images[0]} name={v.name} subtitle={v.subtitle} className="aspect-[4/3]" />
                    <div className="border-b border-white/10 py-6">
                      <p className="eyebrow">{v.category}</p>
                      <h3 className="h-display mt-2 text-4xl">
                        {v.name} {v.subtitle && !v.name.includes(v.subtitle) && <span className="text-mist">{v.subtitle}</span>}
                      </h3>
                      <div className="mt-6 flex flex-wrap items-baseline gap-4">
                        <span className="h-display text-6xl md:text-7xl">{formatMoney(p.promoDailyPriceCents)}</span>
                        <s className="text-2xl text-mist decoration-white/60">{formatMoney(v.dailyPriceCents)}</s>
                        <span className="eyebrow">/ day</span>
                      </div>
                      <span className="mt-6 inline-flex items-center gap-3 font-wide text-[10px] tracking-[0.3em] text-silver group-hover:text-white">
                        RESERVE AT THIS RATE <ArrowIcon />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {p.disclaimer && <p className="mt-10 max-w-3xl text-xs leading-relaxed text-mist">{p.disclaimer}</p>}
            </div>
          );
        })}
      </section>
    </>
  );
}
