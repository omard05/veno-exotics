import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { logout } from "../actions";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-ink text-bone md:flex">
      <aside className="border-b border-white/10 bg-coal md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between p-5 md:block">
          <Link href="/admin" className="block">
            <span className="font-wide text-lg font-bold tracking-[0.4em]">VENO</span>
            <span className="block font-wide text-[8px] tracking-[0.35em] text-mist">DASHBOARD</span>
          </Link>
          <div className="flex gap-3 text-xs md:hidden">
            <Link href="/" target="_blank" className="text-silver">View site</Link>
            <form action={logout}><button className="text-silver">Sign out</button></form>
          </div>
        </div>
        <AdminNav />
        <div className="hidden space-y-2 p-5 text-xs md:absolute md:bottom-0 md:block">
          <Link href="/" target="_blank" className="block text-silver hover:text-white">View website ↗</Link>
          <form action={logout}><button className="text-silver hover:text-white">Sign out</button></form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-5 md:p-10">{children}</main>
    </div>
  );
}
