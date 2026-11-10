import Link from "next/link";
import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { BRAND } from "@/lib/site";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "About Us" };

export default async function About() {
  const s = await getSettings();
  return (
    <>
      <PageHero eyebrow="About VENO" title={<>Where luxury meets <em className="italic">performance.</em></>} />
      <section className="container-x grid gap-16 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-7">
          {s.aboutBody.split(/\n{2,}/).map((p, i) => (
            <p key={i} className={`${i === 0 ? "h-display text-3xl md:text-4xl leading-snug text-white" : "mt-6 text-lg text-silver"} ${i > 0 ? "" : ""}`}>
              {p}
            </p>
          ))}
          <p className="mt-12 font-wide text-xs tracking-[0.35em]">{BRAND.tagline}</p>
        </div>
        <aside className="space-y-10 md:col-span-4 md:col-start-9">
          <div>
            <p className="eyebrow mb-3">Based in</p>
            <p className="text-lg">{s.address}</p>
          </div>
          <div>
            <p className="eyebrow mb-3">Serving</p>
            <ul className="space-y-1 text-lg">{s.serviceAreas.map((a) => <li key={a}>{a}</li>)}</ul>
          </div>
          <div>
            <p className="eyebrow mb-3">Hours</p>
            <p className="text-lg">{s.hours}</p>
          </div>
          <div className="flex flex-wrap gap-3 pt-4">
            <Link href="/fleet" className="btn-light">Our Fleet</Link>
            <Link href="/contact" className="btn-ghost">Contact</Link>
          </div>
        </aside>
      </section>
    </>
  );
}
