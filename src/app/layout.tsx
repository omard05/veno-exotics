import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BRAND } from "@/lib/site";

// Every page reads live prices, promotions and availability — never serve stale HTML.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://venoexotics.com"),
  title: {
    default: `${BRAND.fullName} | Newport Beach Luxury & Exotic Car Rental`,
    template: `%s | ${BRAND.fullName}`,
  },
  description:
    "VENO Exotic Car Rentals — luxury and exotic vehicle rentals in Newport Beach, serving Orange County and Los Angeles. Not your average rental.",
  openGraph: { siteName: BRAND.fullName, type: "website" },
};

export const viewport: Viewport = { themeColor: "#050505" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&family=Syncopate:wght@400;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
