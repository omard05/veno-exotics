import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ConsignmentForm } from "@/components/PublicForms";

export const metadata: Metadata = {
  title: "Consignment",
  description: "Own a luxury or exotic vehicle? Submit it to VENO Exotic Car Rentals for consideration.",
};

export default function Consignment() {
  return (
    <>
      <PageHero
        eyebrow="Consignment"
        title={<>Your vehicle, <em className="italic">our fleet.</em></>}
        intro="Own a luxury or exotic vehicle? Submit it for consideration to join the VENO fleet. Share your vehicle's details below and our team will review your submission."
      />
      <section className="container-x grid gap-16 py-20 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow mb-6">How it works</p>
          <ol className="space-y-8">
            {[
              ["Submit", "Tell us about your vehicle and how to reach you."],
              ["Review", "Our team reviews each submission individually."],
              ["Conversation", "If your vehicle is a fit, we'll contact you to discuss the details and terms directly."],
            ].map(([t, d], i) => (
              <li key={t} className="border-t border-white/15 pt-5">
                <span className="font-wide text-[10px] tracking-[0.3em] text-mist">0{i + 1}</span>
                <h3 className="h-display mt-2 text-3xl">{t}</h3>
                <p className="mt-2 text-sm text-silver">{d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-xs leading-relaxed text-mist">Submitting a vehicle does not create an agreement. All consignment arrangements are subject to review and a separate written agreement.</p>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <ConsignmentForm />
        </div>
      </section>
    </>
  );
}
