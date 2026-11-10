import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { BrokerForm } from "@/components/PublicForms";

export const metadata: Metadata = {
  title: "Brokers",
  description: "Apply to become a VENO Exotic Car Rentals referral partner.",
};

export default function Brokers() {
  return (
    <>
      <PageHero
        eyebrow="Brokers & Referral Partners"
        title={<>Partner with <em className="italic">VENO.</em></>}
        intro="Concierges, planners, hospitality professionals and connected individuals: apply to become a VENO referral partner and introduce your clients to our fleet."
      />
      <section className="container-x grid gap-16 py-20 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow mb-6">The referral process</p>
          <ol className="space-y-8">
            {[
              ["Apply", "Submit the application with details about you and your network."],
              ["Review", "The VENO team reviews each application personally."],
              ["Onboarding", "Approved partners are contacted directly to discuss the referral program and its terms."],
              ["Refer", "Introduce your clients to VENO. Every referred reservation goes through our standard request-and-approval process."],
            ].map(([t, d], i) => (
              <li key={t} className="border-t border-white/15 pt-5">
                <span className="font-wide text-[10px] tracking-[0.3em] text-mist">0{i + 1}</span>
                <h3 className="h-display mt-2 text-3xl">{t}</h3>
                <p className="mt-2 text-sm text-silver">{d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-xs leading-relaxed text-mist">Referral terms and compensation are shared directly with approved partners. Submitting an application does not guarantee acceptance into the program.</p>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <BrokerForm />
        </div>
      </section>
    </>
  );
}
