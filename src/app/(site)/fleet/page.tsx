import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { PageHero } from "@/components/PageHero";
import { VehicleCard } from "@/components/VehicleCard";

export const metadata: Metadata = {
  title: "Our Fleet",
  description: "Luxury and exotic vehicles available for rental from VENO in Newport Beach.",
};

export default async function Fleet() {
  const { vehicles } = await getCatalog();
  return (
    <>
      <PageHero
        eyebrow="Our Fleet"
        title={<>The <em className="italic">collection.</em></>}
        intro="Ultra-luxury and performance vehicles, available in Newport Beach for Orange County and Los Angeles."
      />
      <section className="container-x py-20 md:py-28">
        {vehicles.length === 0 ? (
          <p className="text-silver">New vehicles are being added to the fleet. Please check back soon.</p>
        ) : (
          <div className="grid gap-x-8 gap-y-16 md:grid-cols-2">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} v={v} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
