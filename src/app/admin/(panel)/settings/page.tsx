import { getSettings } from "@/lib/data";
import { saveSiteSettings } from "../../actions";
import { Notice, PageTitle, btnPrimary, type SP } from "../ui";

export default async function Settings({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const s = await getSettings();
  const input = (name: keyof typeof s, label: string) => (
    <div><label className="a-label" htmlFor={name}>{label}</label><input id={name} name={name} defaultValue={String(s[name] ?? "")} className="a-input" /></div>
  );
  return (
    <>
      <PageTitle title="Site Settings" sub="Contact details, social links, photography and page content." />
      <Notice sp={sp} />
      <form action={saveSiteSettings} className="grid gap-6 xl:grid-cols-2">
        <section className="a-card space-y-4">
          <h2 className="font-medium">Contact</h2>
          {input("phone", "Phone")}
          {input("email", "Public email")}
          {input("address", "Address")}
          {input("hours", "Hours")}
          {input("website", "Website")}
          <div><label className="a-label">Service areas (one per line)</label><textarea name="serviceAreas" rows={3} defaultValue={s.serviceAreas.join("\n")} className="a-input" /></div>
        </section>
        <section className="a-card space-y-4">
          <h2 className="font-medium">Social</h2>
          {input("instagramHandle", "Instagram handle")}
          {input("instagramUrl", "Instagram link")}
          {input("tiktokHandle", "TikTok handle")}
          {input("tiktokUrl", "TikTok link")}
          <h2 className="pt-4 font-medium">Photography</h2>
          {input("heroImage", "Home page hero image URL (leave empty to use the first vehicle photo)")}
          <div>
            <label className="a-label">Instagram / TikTok gallery (one per line: image URL | caption | optional post link)</label>
            <textarea name="gallery" rows={6} defaultValue={s.gallery.map((g) => [g.src, g.alt, g.href].filter((x, i) => x || i < 2).join(" | ")).join("\n")} className="a-input font-mono text-xs" placeholder="/images/gallery/1.jpg | Maybach at sunset | https://www.instagram.com/p/…" />
            <p className="mt-1 text-xs text-mist">The gallery appears on the home page only once images are added.</p>
          </div>
        </section>
        <section className="a-card space-y-4 xl:col-span-2">
          <h2 className="font-medium">Experiences page</h2>
          <p className="text-xs text-mist">Separate each experience with a line containing only <code>---</code>. First line is the title, optionally followed by a line <code>image: URL</code>, then the description.</p>
          <textarea name="experiences" rows={14} defaultValue={s.experiences.map((e) => [e.title, e.image ? `image: ${e.image}` : "", e.body].filter(Boolean).join("\n")).join("\n---\n")} className="a-input font-mono text-xs" />
          <h2 className="pt-4 font-medium">About page</h2>
          <textarea name="aboutBody" rows={6} defaultValue={s.aboutBody} className="a-input" />
          <p className="text-xs text-mist">Separate paragraphs with a blank line.</p>
        </section>
        <div className="xl:col-span-2"><button className={btnPrimary}>Save settings</button></div>
      </form>
    </>
  );
}
