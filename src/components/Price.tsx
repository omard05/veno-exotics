import { formatMoney } from "@/lib/money";
import type { CatalogVehicle } from "@/lib/catalog";

/** Daily price. With a live promotion, the regular price is shown struck through. */
export function Price({ v, size = "md" }: { v: CatalogVehicle; size?: "md" | "lg" }) {
  const big = size === "lg" ? "text-5xl md:text-6xl" : "text-3xl";
  if (v.promo) {
    return (
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className={`h-display ${big} text-white`}>{formatMoney(v.promo.promoDailyPriceCents)}</span>
        <s className="text-lg text-mist decoration-white/60" aria-label={`Regular price ${formatMoney(v.dailyPriceCents)}`}>
          {formatMoney(v.dailyPriceCents)}
        </s>
        <span className="eyebrow">/ day</span>
      </div>
    );
  }
  return (
    <div className="flex items-baseline gap-3">
      <span className={`h-display ${big}`}>{formatMoney(v.dailyPriceCents)}</span>
      <span className="eyebrow">/ day</span>
    </div>
  );
}

export function PromoBadge({ title }: { title: string }) {
  return (
    <span className="inline-flex items-center gap-2 bg-white px-3 py-1.5 font-wide text-[8px] font-bold tracking-[0.3em] text-ink uppercase">
      {title}
    </span>
  );
}
