import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Hakkımızda | Binboğa Kooperatif Balı",
  description:
    "1973'ten bu yana Kozan'ın dağlarından gelen doğal bal. S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi'nin hikayesi.",
};

const stats = [
  { value: "1973", label: "Kuruluş Yılı" },
  { value: "1800+", label: "Arıcı Üye" },
  { value: "50+", label: "Yıllık Deneyim" },
  { value: "%100", label: "Doğal Bal" },
];

const values = [
  {
    icon: "🤝",
    title: "Kooperatif Ruhu",
    desc: "Kâr değil, adalet peşindeyiz. Arıcılarımız ne kazanıyorsa kooperatif de o kadar kazanıyor.",
  },
  {
    icon: "🔬",
    title: "Bilimsel Kalite",
    desc: "Her seri üretimde Türk Gıda Kodeksi standartlarına uygun bağımsız laboratuvar analizleri yapılır.",
  },
  {
    icon: "🌿",
    title: "Doğallık",
    desc: "Arılarımız Toros dağlarının endemik bitki örtüsünden nektar toplar. Şeker şurubu veya katkı maddesi asla kullanmayız.",
  },
  {
    icon: "📦",
    title: "Şeffaflık",
    desc: "Ürünlerimizin her birinde hangi sezondan geldiğini, üretici kooperatifin kim olduğunu açıkça belirtiriz.",
  },
];

const timeline = [
  { year: "1973", event: "S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi kuruldu." },
  { year: "1985", event: "İlk modern ambalajlama tesisi devreye alındı; raf ömrü ve hijyen standartları yükseltildi." },
  { year: "1997", event: "İhracat başladı. Almanya ve Hollanda pazarlarına ilk sevkiyatlar gerçekleşti." },
  { year: "2008", event: "ISO 22000 Gıda Güvenliği sertifikası alındı." },
  { year: "2015", event: "Üye sayısı 1 000'i aştı; Toros dağlarındaki kovanlar 45 000'e ulaştı." },
  { year: "2022", event: "London Honey Gold ödülüne layık görüldük." },
  { year: "2024", event: "E-ticaret platformumuz açıldı; arıcıdan tüketiciye doğrudan satış başladı." },
];

export default async function AboutPage() {
  const bannerSetting = await prisma.siteSetting.findUnique({ where: { key: "banner_hakkimizda" } });
  const bannerImage = bannerSetting?.value ?? null;

  return (
    <>
      {/* Hero */}
      <section className="relative h-80 md:h-[500px] overflow-hidden bg-gray-900">
        {bannerImage ? (
          <>
            <Image
              src={bannerImage}
              alt="Hakkımızda banner"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-honey-bright"
                style={{
                  width: (((i * 37) % 80) + 20),
                  height: (((i * 53) % 80) + 20),
                  top: `${(i * 17) % 100}%`,
                  left: `${(i * 23) % 100}%`,
                }}
              />
            ))}
          </div>
        )}
        <div className="relative z-10 h-full flex items-center justify-start">
          <div className="max-w-7xl px-4 sm:px-6 lg:px-8 text-left">
            <p className="text-honey-bright text-sm font-bold uppercase tracking-widest mb-3">1973&apos;ten Bugüne</p>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Şirket Değil, Kooperatif!
            </h1>
            <p className="hidden sm:block text-white/80 text-lg max-w-2xl">
              Kozan dağlarının arıcıları 50 yılı aşkın süredir tek bir amaç etrafında birleşiyor:
              doğal balı, adil bir fiyatla, doğrudan sizin sofranıza taşımak.
            </p>
          </div>
        </div>
      </section>

      {/* İstatistikler */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl font-black text-honey-dark">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hikayemiz */}
      <section className="py-16 bg-honey-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-6">Hikayemiz</h2>
              <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                <p>
                  1973 yılında, Adana&apos;nın Kozan ilçesinde birkaç arıcı aile bir karar verdi. Tek başına
                  ayakta kalmanın zor olduğunu biliyorlardı. İşte o gün, yükü paylaşmak için bir araya
                  geldiler. <strong>S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi</strong> böyle doğdu.
                </p>
                <p>
                  Bugün 1800&apos;den fazla arıcı üyesiyle Türkiye&apos;nin en köklü bal kooperatiflerinden biriyiz.
                  Toroslar&apos;ın endemik çiçeklerinden — kekik, keven, narenciye, çalıkuşu — beslenen arılarımız
                  yılda iki sezon hasat verir.
                </p>
                <p>
                  Ama en önemli farkımız bu değil. En önemli farkımız şu: <strong>kâr amacımız yok.</strong>{" "}
                  Kooperatif yapımız sayesinde arıcılarımıza piyasa fiyatının üzerinde ödeme yapıyor,
                  tüketicilere de aracı komisyonu olmadan ulaşıyoruz.
                </p>
              </div>
            </div>
            <div className="bg-honey-dark rounded-3xl p-8 text-white">
              <div className="text-6xl mb-4">🍯</div>
              <h3 className="text-xl font-black mb-4">Kooperatif neden önemli?</h3>
              <ul className="space-y-3 text-sm text-white/80">
                <li className="flex gap-3">
                  <span className="text-honey-bright font-bold">→</span>
                  Arıcı doğrudan kooperatife teslim eder; aracı komisyonu yok
                </li>
                <li className="flex gap-3">
                  <span className="text-honey-bright font-bold">→</span>
                  Kalite kontrolü ve ambalajlama merkezi yapılır
                </li>
                <li className="flex gap-3">
                  <span className="text-honey-bright font-bold">→</span>
                  Yıl sonu kârı üyelere paylaştırılır
                </li>
                <li className="flex gap-3">
                  <span className="text-honey-bright font-bold">→</span>
                  Tüketici, markayı değil emeği öder
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Değerlerimiz */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12">Değerlerimiz</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-honey-cream rounded-2xl p-6">
                <div className="text-4xl mb-3">{v.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarihçe */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12">Tarihçemiz</h2>
          <div className="relative">
            <div className="absolute left-20 top-0 bottom-0 w-px bg-honey-light" />
            <div className="space-y-8">
              {timeline.map((item) => (
                <div key={item.year} className="flex gap-6 items-start">
                  <div className="w-16 text-right shrink-0">
                    <span className="text-honey-dark font-black text-sm">{item.year}</span>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-honey-dark border-2 border-white shadow" />
                    <p className="text-sm text-gray-600 leading-relaxed">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-honey-dark text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-black mb-4">Doğal Balı Keşfedin</h2>
          <p className="text-white/80 mb-8 text-sm">
            Arıcıdan sofranzıa. Kovan kokusunu taşıyan, analiz sertifikalı Binboğa ballarını inceleyin.
          </p>
          <Link href="/urunlerimiz" className="btn-secondary inline-flex items-center gap-2">
            Ürünlerimize Git →
          </Link>
        </div>
      </section>
    </>
  );
}
