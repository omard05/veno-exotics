/* eslint-disable @next/next/no-img-element */

/**
 * Large cinematic vehicle image. When no photo has been uploaded yet, renders
 * an editorial placeholder (name set in type over a studio-light gradient)
 * rather than a stock photo of a different car.
 */
export function VehicleImage({
  src,
  name,
  subtitle,
  className = "",
  priority = false,
}: {
  src?: string;
  name: string;
  subtitle?: string;
  className?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-coal ${className}`}>
        <img
          src={src}
          alt={name}
          loading={priority ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/10" />
      </div>
    );
  }
  return (
    <div className={`grain relative overflow-hidden bg-coal ${className}`} role="img" aria-label={`${name} — photography coming soon`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_100%,rgba(255,255,255,0.16),transparent_70%)]" />
      <div className="absolute inset-x-[8%] bottom-[22%] h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        {subtitle && <span className="eyebrow mb-3">{subtitle}</span>}
        <span className="h-display text-[clamp(1.8rem,5vw,4.5rem)] text-white/85 transition-transform duration-[1.6s] group-hover:scale-[1.03]">
          {name}
        </span>
      </div>
      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-wide text-[8px] tracking-[0.4em] text-white/30">
        PHOTOGRAPHY COMING SOON
      </span>
    </div>
  );
}
