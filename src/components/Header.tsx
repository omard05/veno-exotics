"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { NAV } from "@/lib/nav";


export function Header({ hasSpecial }: { hasSpecial: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open ? "bg-ink/90 backdrop-blur-md border-b border-white/5" : "bg-gradient-to-b from-black/70 to-transparent"
      }`}
    >
      <div className="container-x flex h-20 items-center justify-between">
        <Logo />
        <nav className="hidden xl:flex items-center gap-8" aria-label="Main">
          {NAV.slice(1).map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`relative font-wide text-[9px] tracking-[0.3em] uppercase transition-colors ${
                active(n.href) ? "text-white" : "text-silver/70 hover:text-white"
              }`}
            >
              {n.label}
              {n.href === "/specials" && hasSpecial && (
                <span className="absolute -right-3 -top-1 h-1.5 w-1.5 rounded-full bg-white" aria-label="Live offer" />
              )}
            </Link>
          ))}
          <Link href="/book" className="btn-ghost !px-5 !py-3">
            Reserve
          </Link>
        </nav>
        <button
          className="xl:hidden -mr-2 p-2"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`block h-px w-7 bg-white transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
          <span className={`mt-1.5 block h-px w-7 bg-white transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
        </button>
      </div>
      {open && (
        <nav className="xl:hidden h-[calc(100dvh-5rem)] overflow-y-auto bg-ink container-x py-8 flex flex-col" aria-label="Mobile">
          {NAV.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              className="rise flex items-baseline justify-between border-b border-white/10 py-4"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="h-display text-4xl">{n.label}</span>
              {n.href === "/specials" && hasSpecial && <span className="eyebrow !text-white">Live offer</span>}
            </Link>
          ))}
          <Link href="/book" className="btn-light mt-8">
            Request a Reservation
          </Link>
        </nav>
      )}
    </header>
  );
}
