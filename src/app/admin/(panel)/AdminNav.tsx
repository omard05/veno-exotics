"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  ["/admin", "Overview"],
  ["/admin/requests", "Booking Requests"],
  ["/admin/vehicles", "Vehicles & Pricing"],
  ["/admin/promotions", "Promotions"],
  ["/admin/availability", "Availability"],
  ["/admin/consignment", "Consignment"],
  ["/admin/brokers", "Brokers"],
  ["/admin/messages", "Messages"],
  ["/admin/settings", "Site Settings"],
] as const;

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-0.5 md:px-3">
      {ITEMS.map(([href, label]) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return (
          <Link key={href} href={href} className={`block shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm ${active ? "bg-white/10 text-white" : "text-silver hover:bg-white/5 hover:text-white"}`}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
