import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { unavailableDates } from "@/lib/data";
import { PageHero } from "@/components/PageHero";
import { BookingForm, type BookingVehicle } from "./BookingForm";

export const metadata: Metadata = { title: "Request a Reservation" };

export default async function Book({ searchParams }: { searchParams: Promise<{ vehicle?: string }> }) {
  const { vehicle } = await searchParams;
  const { vehicles, livePromos, today } = await getCatalog();
  const unavailable = Object.fromEntries(await Promise.all(vehicles.map(async (v) => [v.id, await unavailableDates(v.id)] as const)));

  const bv: BookingVehicle[] = vehicles.map((v) => ({
    id: v.id,
    slug: v.slug,
    name: v.name,
    subtitle: v.subtitle,
    category: v.category,
    dailyPriceCents: v.dailyPriceCents,
    depositCents: v.depositCents,
    includedMilesPerDay: v.includedMilesPerDay,
    extraMileCents: v.extraMileCents,
    minDays: v.minDays,
    promoDailyPriceCents: v.promo?.promoDailyPriceCents,
    promoTitle: v.promo?.title,
  }));

  const promos = livePromos.map((p) => ({
    id: p.id,
    title: p.title,
    vehicleIds: p.vehicleIds,
    promoDailyPriceCents: p.promoDailyPriceCents,
    startsOn: p.startsOn,
    endsOn: p.endsOn,
    enabled: p.enabled,
  }));

  return (
    <>
      <PageHero
        eyebrow="Request to Book"
        title={<>Reserve your <em className="italic">drive.</em></>}
        intro="Select your vehicle and schedule, then send your request. Every reservation is reviewed personally by the VENO team before it is confirmed."
      />
      <section className="container-x py-16 md:py-24">
        {bv.length === 0 ? (
          <p className="text-silver">No vehicles are currently available to book. Please contact us directly.</p>
        ) : (
          <BookingForm vehicles={bv} promos={promos} unavailable={unavailable} today={today} initialSlug={vehicle} disclaimer={livePromos[0]?.disclaimer} />
        )}
      </section>
    </>
  );
}
