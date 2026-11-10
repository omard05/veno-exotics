import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="VENO Exotic Car Rentals — Home" className={`group inline-flex flex-col leading-none ${className}`}>
      <span className="font-wide text-xl md:text-2xl font-bold tracking-[0.45em] text-bone group-hover:text-white transition-colors">
        VENO
      </span>
      <span className="mt-1 font-wide text-[7px] tracking-[0.55em] text-mist">EXOTIC CAR RENTALS</span>
    </Link>
  );
}
