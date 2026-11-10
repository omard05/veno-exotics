import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/PublicForms";
import { InstagramIcon, TikTokIcon } from "@/components/Icons";

export const metadata: Metadata = { title: "Contact" };

export default async function Contact() {
  const s = await getSettings();
  const tel = s.phone.replace(/[^\d+]/g, "");
  const items: [string, React.ReactNode][] = [
    ["Phone", <a key="p" href={`tel:${tel}`} className="hover:underline">{s.phone}</a>],
    ["Email", <a key="e" href={`mailto:${s.email}`} className="break-all hover:underline">{s.email}</a>],
    ["Address", <a key="a" href={`https://maps.google.com/?q=${encodeURIComponent(s.address)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{s.address}</a>],
    ["Hours", s.hours],
    ["Service areas", s.serviceAreas.join(" · ")],
  ];
  return (
    <>
      <PageHero eyebrow="Contact" title={<>Let&apos;s get you <em className="italic">driving.</em></>} />
      <section className="container-x grid gap-16 py-20 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <dl className="divide-y divide-white/10 border-y border-white/10">
            {items.map(([k, v]) => (
              <div key={k} className="py-6">
                <dt className="eyebrow">{k}</dt>
                <dd className="h-display mt-2 text-2xl md:text-3xl">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost"><InstagramIcon /> {s.instagramHandle}</a>
            <a href={s.tiktokUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost"><TikTokIcon /> {s.tiktokHandle}</a>
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <p className="eyebrow mb-8">Send a message</p>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
