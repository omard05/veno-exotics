export function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: React.ReactNode; intro?: React.ReactNode }) {
  return (
    <section className="grain relative overflow-hidden border-b border-white/10 pt-40 pb-16 md:pt-48 md:pb-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_0%,rgba(255,255,255,0.08),transparent_70%)]" />
      <div className="container-x relative">
        <p className="eyebrow rise">{eyebrow}</p>
        <h1 className="h-display rise rise-2 mt-6 max-w-5xl text-[clamp(3rem,9vw,8rem)]">{title}</h1>
        {intro && <div className="rise rise-3 mt-8 max-w-2xl text-lg leading-relaxed text-silver">{intro}</div>}
      </div>
    </section>
  );
}
