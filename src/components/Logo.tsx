import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="VENO Exotic Car Rentals — Home" className={`group inline-flex flex-col leading-none ${className}`}>
      <span className="font-wide text-2xl md:text-3xl font-black tracking-[0.3em] text-bone group-hover:text-white transition-colors">
        VENO
      </span>
      <span className="mt-1 font-wide text-[10px] font-semibold tracking-[0.2em] text-mist">EXOTIC CAR RENTALS</span>
    </Link>
  );
}
