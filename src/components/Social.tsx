/* eslint-disable @next/next/no-img-element */
import { InstagramIcon, TikTokIcon } from "./Icons";
import type { SiteSettings } from "@/lib/site";

/** Social section with an optional photo gallery (managed in Admin → Settings). */
export function Social({ s }: { s: SiteSettings }) {
  return (
    <section className="container-x py-24 md:py-32">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Follow VENO</p>
          <h2 className="h-display mt-4 text-5xl md:text-7xl">{s.instagramHandle}</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            <InstagramIcon /> Instagram {s.instagramHandle}
          </a>
          <a href={s.tiktokUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            <TikTokIcon /> TikTok {s.tiktokHandle}
          </a>
        </div>
      </div>
      {s.gallery.length > 0 && (
        <div className="mt-14 grid grid-cols-2 gap-2 md:grid-cols-4">
          {s.gallery.map((g, i) => (
            <a
              key={i}
              href={g.href || s.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative overflow-hidden bg-coal ${i === 0 ? "md:col-span-2 md:row-span-2" : ""} aspect-square`}
            >
              <img src={g.src} alt={g.alt || "VENO Exotic Car Rentals"} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
