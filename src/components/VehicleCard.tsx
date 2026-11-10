import Link from "next/link";
import { VehicleImage } from "./VehicleImage";
import { Price, PromoBadge } from "./Price";
import { ArrowIcon } from "./Icons";
import type { CatalogVehicle } from "@/lib/catalog";

export function VehicleCard({ v, large = false }: { v: CatalogVehicle; large?: boolean }) {
  return (
    <Link href={`/fleet/${v.slug}`} className="group block">
      <div className="relative">
        <VehicleImage
          src={v.images[0]}
          name={v.name}
          subtitle={v.subtitle}
          className={large ? "aspect-[16/9]" : "aspect-[4/3]"}
        />
        {v.promo && (
          <div className="absolute left-4 top-4">
            <PromoBadge title={v.promo.title} />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-4 border-b border-white/10 py-6">
        <div>
          <p className="eyebrow">{v.category}</p>
          <h3 className="h-display mt-2 text-3xl md:text-4xl">
            {v.name}
            {v.subtitle && !v.name.includes(v.subtitle) && <span className="text-mist"> {v.subtitle}</span>}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <Price v={v} />
          <span className="mt-2 inline-flex items-center gap-2 font-wide text-[9px] tracking-[0.3em] text-silver group-hover:text-white">
            VIEW <ArrowIcon />
          </span>
        </div>
      </div>
    </Link>
  );
}
