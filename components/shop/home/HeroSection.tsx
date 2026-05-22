import Link from "next/link";

interface HeroSectionProps {
  title?: string;
  imageSrc?: string;
}

export function HeroSection({
  title = "Binlerce Arının &\nBinlerce Arıcının\nKusursuz Emeği",
  imageSrc,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[520px] md:min-h-[600px] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-honey-dark via-honey-medium to-honey">
        {imageSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt=""
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
      </div>

      {/* Dekoratif petek deseni */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: "radial-gradient(circle, #FCD908 2px, transparent 2px)",
          backgroundSize: "30px 30px",
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-lg">
          <p className="text-honey-bright font-semibold text-sm mb-3 tracking-wide uppercase">
            1973 Kozan — Kooperatif Balı
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight whitespace-pre-line drop-shadow-lg">
            {title}
          </h1>

          <div className="mt-8 flex gap-4 flex-wrap">
            <Link href="/urunlerimiz" className="btn-secondary text-sm">
              Ürünleri Keşfet
            </Link>
            <Link
              href="/hakkimizda"
              className="inline-flex items-center gap-2 border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-honey-dark transition-all duration-200 text-sm"
            >
              Hikayemiz
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-10 flex gap-8">
            <div>
              <div className="text-2xl font-black text-honey-bright">1800+</div>
              <div className="text-xs text-white/70">Arıcı Üye</div>
            </div>
            <div>
              <div className="text-2xl font-black text-honey-bright">50 Yıl</div>
              <div className="text-xs text-white/70">Tecrübe</div>
            </div>
            <div>
              <div className="text-2xl font-black text-honey-bright">%100</div>
              <div className="text-xs text-white/70">Doğal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none">
          <path d="M0,60 C360,0 1080,60 1440,20 L1440,60 Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
