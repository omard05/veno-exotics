/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getCatalog } from "@/lib/catalog";
import { getSettings } from "@/lib/data";
import { BRAND } from "@/lib/site";
import { VehicleCard } from "@/components/VehicleCard";
import { PromoStrip } from "@/components/PromoStrip";
import { Social } from "@/components/Social";
import { ArrowIcon } from "@/components/Icons";

export default async function Home() {
  const [{ vehicles }, s] = await Promise.all([getCatalog(), getSettings()]);
  const hero = s.heroImage || vehicles.find((v) => v.images[0])?.images[0];

  return (
    <>
      {/* HERO */}
      <section className="grain relative flex min-h-[100svh] items-end overflow-hidden">
        {hero ? (
          <>
            <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_110%,rgba(255,255,255,0.18),transparent_65%),radial-gradient(ellipse_50%_40%_at_85%_10%,rgba(255,255,255,0.06),transparent_70%)]" />
        )}
        <div className="container-x relative pb-20 md:pb-28">
          <p className="eyebrow rise !text-silver">Newport Beach · Orange County · Los Angeles</p>
          <h1 className="h-display rise rise-2 mt-6 text-[clamp(3.4rem,11vw,11rem)]">
            Not your<br />
            <em className="italic">average</em> rental.
          </h1>
          <div className="rise rise-3 mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="font-display text-2xl italic text-silver md:text-3xl">{BRAND.supportingTagline}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/book" className="btn-light">Reserve Now <ArrowIcon /></Link>
              <Link href="/fleet" className="btn-ghost">View the Fleet</Link>
            </div>
          </div>
        </div>
      </section>

      <PromoStrip vehicles={vehicles} />

      {/* FLEET */}
      <section className="container-x py-24 md:py-32">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">The Fleet</p>
            <h2 className="h-display mt-4 text-5xl md:text-7xl">Select your drive.</h2>
          </div>
          <Link href="/fleet" className="font-wide text-[10px] tracking-[0.3em] text-silver hover:text-white inline-flex items-center gap-3">
            ALL VEHICLES <ArrowIcon />
          </Link>
        </div>
        <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">
          {vehicles.map((v, i) => (
            <div key={v.id} className={i === 0 ? "md:col-span-2" : ""}>
              <VehicleCard v={v} large={i === 0} />
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-white/10 bg-coal">
        <div className="container-x grid gap-14 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-4">
            <p className="eyebrow">Request to Book</p>
            <h2 className="h-display mt-4 text-5xl md:text-6xl">Every reservation, personally reviewed.</h2>
          </div>
          <ol className="grid gap-10 sm:grid-cols-2 md:col-span-8 md:grid-cols-4">
            {[
              ["Select", "Choose your vehicle from the VENO fleet."],
              ["Schedule", "Pick your pickup and return dates and times."],
              ["Request", "Review your estimate and send your request."],
              ["Confirm", "Our team reviews your request and contacts you to confirm."],
            ].map(([t, d], i) => (
              <li key={t} className="border-t border-white/20 pt-6">
                <span className="font-wide text-[10px] tracking-[0.3em] text-mist">0{i + 1}</span>
                <h3 className="h-display mt-4 text-3xl">{t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-silver">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SERVICE AREAS */}
      <section className="container-x py-24 md:py-32">
        <p className="eyebrow">Service Areas</p>
        <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {s.serviceAreas.map((a) => (
            <p key={a} className="h-display py-6 text-[clamp(2.5rem,7vw,6rem)] text-white/90">{a}</p>
          ))}
        </div>
        <p className="mt-8 max-w-xl text-silver">
          Based at {s.address}. Open {s.hours.replace(/^Monday–Sunday,\s*/i, "")}, seven days a week.
        </p>
      </section>

      <Social s={s} />

      {/* CTA */}
      <section className="grain relative overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_50%_100%,rgba(255,255,255,0.1),transparent_70%)]" />
        <div className="container-x relative py-28 text-center md:py-40">
          <p className="eyebrow">{BRAND.tagline}</p>
          <h2 className="h-display mx-auto mt-6 max-w-4xl text-5xl md:text-8xl">Your next drive starts here.</h2>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Link href="/book" className="btn-light">Request a Reservation</Link>
            <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`} className="btn-ghost">Call {s.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
