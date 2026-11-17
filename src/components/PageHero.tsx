import { PhotoSlot } from "./PhotoSlot";
import type { SlotId } from "@/lib/photos";

export function PageHero({
  eyebrow,
  title,
  intro,
  slot,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  slot?: SlotId;
}) {
  return (
    <section className="relative flex min-h-[60svh] items-end overflow-hidden border-b border-white/10 pt-36 pb-16 md:min-h-[70svh] md:pb-24">
      {slot && <PhotoSlot slot={slot} background priority />}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/90 to-transparent" />
      <div className="container-x relative">
        <p className="eyebrow rise">{eyebrow}</p>
        <h1 className="h-display rise rise-2 mt-5 max-w-5xl text-[clamp(2.6rem,7vw,6.5rem)]">{title}</h1>
        {intro && <div className="rise rise-3 mt-6 max-w-2xl text-lg leading-relaxed text-silver md:text-xl">{intro}</div>}
      </div>
    </section>
  );
}
