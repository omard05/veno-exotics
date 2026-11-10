import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSettings } from "@/lib/data";
import { getCatalog } from "@/lib/catalog";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, { livePromos }] = await Promise.all([getSettings(), getCatalog()]);
  return (
    <>
      <Header hasSpecial={livePromos.length > 0} />
      <main className="min-h-screen">{children}</main>
      <Footer s={s} />
    </>
  );
}
