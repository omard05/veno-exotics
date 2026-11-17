/* eslint-disable @next/next/no-img-element */
import { PHOTOS, type SlotId } from "@/lib/photos";

/**
 * A numbered photo spot. Shows the photo if one is set in src/lib/photos.ts
 * (or passed in via `src`), otherwise a blank box labelled with its slot number.
 *
 * `background` = used behind text: the label sits in a corner so it doesn't clash with headlines.
 */
export function PhotoSlot({
  slot,
  src,
  label,
  className = "",
  background = false,
  dim = true,
  priority = false,
}: {
  slot?: SlotId;
  src?: string;
  label?: string;
  className?: string;
  background?: boolean;
  dim?: boolean;
  priority?: boolean;
}) {
  const url = src || (slot ? PHOTOS[slot] : "");
  const pos = background ? "absolute inset-0" : "relative";

  if (url) {
    return (
      <div className={`${pos} overflow-hidden bg-coal ${className}`}>
        <img
          src={url}
          alt={label || ""}
          loading={priority ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.04]"
        />
        {dim && <div className={`absolute inset-0 ${background ? "bg-black/55" : "bg-gradient-to-t from-black/60 via-transparent to-transparent"}`} />}
      </div>
    );
  }

  return (
    <div
      className={`${pos} overflow-hidden bg-[#2b2b2b] ${className}`}
      role="img"
      aria-label={`Photo placeholder ${slot ?? ""}${label ? ` — ${label}` : ""}`}
    >
      <div className="absolute inset-3 border-2 border-dashed border-white/25" />
      {background ? (
        <div className="absolute right-6 bottom-6 z-10 text-right md:right-10 md:bottom-8">
          <span className="block font-display text-4xl font-extrabold leading-none text-white/60 md:text-6xl">{slot}</span>
          <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60">Background photo</span>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-5xl font-extrabold leading-none text-white/45 md:text-7xl">{slot ?? "PHOTO"}</span>
          <span className="mt-2 px-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/45">{label ? `${label} photo` : "Car photo"}</span>
        </div>
      )}
    </div>
  );
}
