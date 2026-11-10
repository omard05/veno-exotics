import Link from "next/link";
import { Logo } from "./Logo";
import { NAV } from "@/lib/nav";
import { InstagramIcon, TikTokIcon } from "./Icons";
import { BRAND, type SiteSettings } from "@/lib/site";

export function Footer({ s }: { s: SiteSettings }) {
  const tel = s.phone.replace(/[^\d+]/g, "");
  return (
    <footer className="border-t border-white/10 bg-ink">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo />
          <p className="mt-6 font-wide text-[10px] tracking-[0.35em]">{BRAND.tagline}</p>
          <p className="mt-2 font-display italic text-xl text-silver">{BRAND.supportingTagline}</p>
          <div className="mt-6 flex gap-3">
            <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label={`Instagram ${s.instagramHandle}`} className="grid h-10 w-10 place-items-center border border-white/20 hover:bg-white hover:text-ink transition-colors">
              <InstagramIcon />
            </a>
            <a href={s.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label={`TikTok ${s.tiktokHandle}`} className="grid h-10 w-10 place-items-center border border-white/20 hover:bg-white hover:text-ink transition-colors">
              <TikTokIcon />
            </a>
          </div>
        </div>
        <div className="md:col-span-2">
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-2 text-sm text-silver">
            {NAV.slice(1).map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-white">{n.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="eyebrow mb-4">Contact</p>
          <ul className="space-y-2 text-sm text-silver">
            <li><a href={`tel:${tel}`} className="hover:text-white">{s.phone}</a></li>
            <li><a href={`mailto:${s.email}`} className="hover:text-white break-all">{s.email}</a></li>
            <li>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(s.address)}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {s.address}
              </a>
            </li>
            <li>{s.hours}</li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="eyebrow mb-4">Service Areas</p>
          <ul className="space-y-2 text-sm text-silver">
            {s.serviceAreas.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      </div>
      <div className="container-x flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-mist md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} {BRAND.fullName}. All rights reserved.</p>
        <p>{s.website}</p>
      </div>
    </footer>
  );
}
