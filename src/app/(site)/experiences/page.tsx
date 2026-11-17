import Link from "next/link";
import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { PageHero } from "@/components/PageHero";
import { ArrowIcon } from "@/components/Icons";
import { PhotoSlot } from "@/components/PhotoSlot";
import { EXPERIENCE_SLOTS } from "@/lib/photos";

export const metadata: Metadata = { title: "Experiences" };

export default async function Experiences() {
  const s = await getSettings();
  return (
    <>
      <PageHero slot="C10"
        eyebrow="Experiences"
        title={<>More than a <em className="italic">rental.</em></>}
        intro="Every drive is an occasion. Reserve a VENO vehicle for the moments that deserve one."
      />
      <section className="container-x py-20 md:py-28">
        <div className="divide-y divide-white/10 border-y border-white/10">
          {s.experiences.map((e, i) => (
            <article key={e.title} className="grid gap-8 py-14 md:grid-cols-12 md:py-20">
              <span className="font-wide font-semibold text-xs tracking-[0.15em] text-mist md:col-span-1">0{i + 1}</span>
              <h2 className="h-display text-5xl md:col-span-5 md:text-6xl">{e.title}</h2>
              <div className="md:col-span-6">
                <PhotoSlot slot={EXPERIENCE_SLOTS[i]} src={e.image} label={e.title} className="mb-8 aspect-[16/10] w-full" />
                <p className="text-lg leading-relaxed text-silver">{e.body}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-20 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <p className="h-display text-4xl md:text-5xl">Planning something specific?</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/book" className="btn-light">Request a Reservation <ArrowIcon /></Link>
            <Link href="/contact" className="btn-ghost">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
