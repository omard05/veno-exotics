import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { unavailableDates } from "@/lib/data";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { VehicleImage } from "@/components/VehicleImage";
import { Price, PromoBadge } from "@/components/Price";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { ArrowIcon } from "@/components/Icons";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { vehicles } = await getCatalog();
  const v = vehicles.find((x) => x.slug === slug);
  if (!v) return { title: "Vehicle not found" };
  return {
    title: `${v.name}${v.subtitle && !v.name.includes(v.subtitle) ? ` ${v.subtitle}` : ""} Rental`,
    description: `Rent the ${v.name} from VENO Exotic Car Rentals in Newport Beach. ${v.category}.`,
    openGraph: v.images[0] ? { images: [v.images[0]] } : undefined,
  };
}

export default async function VehiclePage({ params }: Props) {
  const { slug } = await params;
  const { vehicles, today } = await getCatalog();
  const v = vehicles.find((x) => x.slug === slug);
  if (!v) notFound();
  const unavailable = await unavailableDates(v.id);
  const others = vehicles.filter((x) => x.id !== v.id);

  const terms: [string, string][] = [
    ["Daily rate", v.promo ? `${formatMoney(v.promo.promoDailyPriceCents)} (regularly ${formatMoney(v.dailyPriceCents)})` : formatMoney(v.dailyPriceCents)],
    ["Included mileage", `${v.includedMilesPerDay} miles per rental day`],
    ["Additional mileage", `${formatMoney(v.extraMileCents)} per mile`],
    ["Security deposit", formatMoney(v.depositCents)],
    ["Minimum rental", `${v.minDays} day${v.minDays === 1 ? "" : "s"}`],
  ];

  return (
    <>
      <section className="relative">
        <VehicleImage src={v.images[0]} name={v.name} subtitle={v.subtitle} priority className="h-[78svh] min-h-[480px] w-full" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent" />
      </section>

      <section className="container-x relative -mt-32 md:-mt-40">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-4">
              <p className="eyebrow !text-silver">{v.category}</p>
              {v.promo && <PromoBadge title={v.promo.title} />}
            </div>
            <h1 className="h-display mt-5 text-[clamp(3rem,8vw,7rem)]">
              {v.name}
              {v.subtitle && !v.name.includes(v.subtitle) && <span className="block text-mist">{v.subtitle}</span>}
            </h1>
            {v.description && <p className="mt-8 max-w-2xl text-lg leading-relaxed text-silver">{v.description}</p>}

            {v.specs.length > 0 && (
              <div className="mt-14">
                <p className="eyebrow mb-4">Specifications</p>
                <dl className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-3">
                  {v.specs.map((s) => (
                    <div key={s.label} className="bg-ink p-5">
                      <dt className="eyebrow">{s.label}</dt>
                      <dd className="h-display mt-2 text-2xl">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          <aside className="lg:col-span-5">
            <div className="border border-white/15 bg-ink/80 p-7 backdrop-blur md:p-9 lg:sticky lg:top-28">
              <Price v={v} size="lg" />
              {v.promo && (
                <p className="mt-3 text-xs text-mist">{v.promo.title} rate through {formatDate(v.promo.endsOn, { weekday: undefined })}.</p>
              )}
              <dl className="mt-8 divide-y divide-white/10 border-y border-white/10 text-sm">
                {terms.map(([k, val]) => (
                  <div key={k} className="flex justify-between gap-4 py-3">
                    <dt className="text-mist">{k}</dt>
                    <dd className="text-right">{val}</dd>
                  </div>
                ))}
              </dl>
              <Link href={`/book?vehicle=${v.slug}`} className="btn-light mt-8 w-full">
                Request to Book <ArrowIcon />
              </Link>
              <p className="mt-4 text-center text-xs text-mist">Requests are reviewed by VENO before confirmation. You will not be charged by submitting a request.</p>
              {v.promo?.disclaimer && <p className="mt-6 text-[11px] leading-relaxed text-mist">{v.promo.disclaimer}</p>}
            </div>
          </aside>
        </div>
      </section>

      {v.images.length > 1 && (
        <section className="container-x mt-24 grid gap-2 md:grid-cols-2">
          {v.images.slice(1).map((src, i) => (
            <VehicleImage key={src} src={src} name={`${v.name} — photo ${i + 2}`} className={i % 3 === 0 ? "aspect-[16/9] md:col-span-2" : "aspect-[4/3]"} />
          ))}
        </section>
      )}

      <section className="container-x py-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Availability</p>
            <h2 className="h-display mt-4 text-5xl">Plan your dates.</h2>
            <p className="mt-4 text-silver">Dates shown as booked are reserved. All other dates may be requested and are subject to confirmation.</p>
          </div>
          <div className="lg:col-span-8">
            <AvailabilityCalendar today={today} unavailable={unavailable} />
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="border-t border-white/10">
          <div className="container-x py-20">
            <p className="eyebrow mb-8">More from the fleet</p>
            <div className="grid gap-6 md:grid-cols-2">
              {others.map((o) => (
                <Link key={o.id} href={`/fleet/${o.slug}`} className="group flex items-center justify-between border-b border-white/10 py-6">
                  <span className="h-display text-3xl md:text-4xl">{o.name} {o.subtitle && !o.name.includes(o.subtitle) && <span className="text-mist">{o.subtitle}</span>}</span>
                  <ArrowIcon className="h-4 w-4 text-silver transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
