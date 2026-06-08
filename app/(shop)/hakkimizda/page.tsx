import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Hakkımızda | Binboğa Kooperatif Balı",
  description:
    "1973'ten bu yana Kozan'ın dağlarından gelen doğal bal. S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi'nin hikayesi.",
};

// ── Varsayılan içerikler (DB boşsa bu değerler kullanılır) ──────────────────
const D = {
  hero_tag: "1973'ten Bugüne",
  hero_h1: "Şirket Değil, Kooperatif!",
  hero_subtitle:
    "Kozan dağlarının arıcıları 50 yılı aşkın süredir tek bir amaç etrafında birleşiyor: doğal balı, adil bir fiyatla, doğrudan sizin sofranıza taşımak.",

  stat_1_value: "1973",  stat_1_label: "Kuruluş Yılı",
  stat_2_value: "1800+", stat_2_label: "Arıcı Üye",
  stat_3_value: "50+",   stat_3_label: "Yıllık Deneyim",
  stat_4_value: "%100",  stat_4_label: "Doğal Bal",

  story_heading: "Hikayemiz",
  story_p1:
    "1973 yılında, Adana'nın Kozan ilçesinde birkaç arıcı aile bir karar verdi. Tek başına ayakta kalmanın zor olduğunu biliyorlardı. İşte o gün, yükü paylaşmak için bir araya geldiler. S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi böyle doğdu.",
  story_p2:
    "Bugün 1800'den fazla arıcı üyesiyle Türkiye'nin en köklü bal kooperatiflerinden biriyiz. Toroslar'ın endemik çiçeklerinden — kekik, keven, narenciye, çalıkuşu — beslenen arılarımız yılda iki sezon hasat verir.",
  story_p3:
    "Ama en önemli farkımız bu değil. En önemli farkımız şu: kâr amacımız yok. Kooperatif yapımız sayesinde arıcılarımıza piyasa fiyatının üzerinde ödeme yapıyor, tüketicilere de aracı komisyonu olmadan ulaşıyoruz.",

  coop_heading: "Kooperatif neden önemli?",
  coop_1: "Arıcı doğrudan kooperatife teslim eder; aracı komisyonu yok",
  coop_2: "Kalite kontrolü ve ambalajlama merkezi yapılır",
  coop_3: "Yıl sonu kârı üyelere paylaştırılır",
  coop_4: "Tüketici, markayı değil emeği öder",

  values_heading: "Değerlerimiz",
  value_1_title: "Kooperatif Ruhu",
  value_1_desc: "Kâr değil, adalet peşindeyiz. Arıcılarımız ne kazanıyorsa kooperatif de o kadar kazanıyor.",
  value_2_title: "Bilimsel Kalite",
  value_2_desc: "Her seri üretimde Türk Gıda Kodeksi standartlarına uygun bağımsız laboratuvar analizleri yapılır.",
  value_3_title: "Doğallık",
  value_3_desc: "Arılarımız Toros dağlarının endemik bitki örtüsünden nektar toplar. Şeker şurubu veya katkı maddesi asla kullanmayız.",
  value_4_title: "Şeffaflık",
  value_4_desc: "Ürünlerimizin her birinde hangi sezondan geldiğini, üretici kooperatifin kim olduğunu açıkça belirtiriz.",

  timeline_heading: "Tarihçemiz",
  timeline_1_year: "1973", timeline_1_event: "S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi kuruldu.",
  timeline_2_year: "1985", timeline_2_event: "İlk modern ambalajlama tesisi devreye alındı; raf ömrü ve hijyen standartları yükseltildi.",
  timeline_3_year: "1997", timeline_3_event: "İhracat başladı. Almanya ve Hollanda pazarlarına ilk sevkiyatlar gerçekleşti.",
  timeline_4_year: "2008", timeline_4_event: "ISO 22000 Gıda Güvenliği sertifikası alındı.",
  timeline_5_year: "2015", timeline_5_event: "Üye sayısı 1 000'i aştı; Toros dağlarındaki kovanlar 45 000'e ulaştı.",
  timeline_6_year: "2022", timeline_6_event: "London Honey Gold ödülüne layık görüldük.",
  timeline_7_year: "2024", timeline_7_event: "E-ticaret platformumuz açıldı; arıcıdan tüketiciye doğrudan satış başladı.",

  cta_heading: "Doğal Balı Keşfedin",
  cta_text: "Arıcıdan sofranzıa. Kovan kokusunu taşıyan, analiz sertifikalı Binboğa ballarını inceleyin.",
  cta_btn: "Ürünlerimize Git →",
} as const;

const PFX = "page_hakkimizda_";
const ALL_KEYS = (Object.keys(D) as (keyof typeof D)[]).map((k) => `${PFX}${k}`);
ALL_KEYS.push("banner_hakkimizda");

function t(db: Record<string, string>, key: keyof typeof D): string {
  return db[`${PFX}${key}`] || D[key];
}

const VALUE_ICONS = ["🤝", "🔬", "🌿", "📦"];

export default async function AboutPage() {
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: ALL_KEYS } } });
  const db = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const bannerImage = db.banner_hakkimizda ?? null;

  const stats = [1, 2, 3, 4].map((i) => ({
    value: t(db, `stat_${i}_value` as keyof typeof D),
    label: t(db, `stat_${i}_label` as keyof typeof D),
  }));

  const values = [1, 2, 3, 4].map((i) => ({
    icon: VALUE_ICONS[i - 1],
    title: t(db, `value_${i}_title` as keyof typeof D),
    desc:  t(db, `value_${i}_desc`  as keyof typeof D),
  }));

  const timeline = [1, 2, 3, 4, 5, 6, 7].map((i) => ({
    year:  t(db, `timeline_${i}_year`  as keyof typeof D),
    event: t(db, `timeline_${i}_event` as keyof typeof D),
  }));

  return (
    <>
      {/* Hero */}
      <section className="relative h-80 md:h-[500px] xl:h-[560px] 2xl:h-[620px] 3xl:h-[680px] 4xl:h-[760px] overflow-hidden bg-honey-cream">
        {bannerImage ? (
          <>
            <Image src={bannerImage} alt="Hakkımızda banner" fill sizes="100vw" className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-honey-bright"
                style={{ width: (((i * 37) % 80) + 20), height: (((i * 53) % 80) + 20), top: `${(i * 17) % 100}%`, left: `${(i * 23) % 100}%` }}
              />
            ))}
          </div>
        )}
        <div className="relative z-10 h-full flex items-center justify-start">
          <div className="max-w-7xl px-4 sm:px-6 lg:px-8 text-left">
            <p className="text-honey-bright text-sm font-bold uppercase tracking-widest mb-3">{t(db, "hero_tag")}</p>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{t(db, "hero_h1")}</h1>
            <p className="hidden sm:block text-white/80 text-lg max-w-2xl">{t(db, "hero_subtitle")}</p>
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
              <h2 className="text-3xl font-black text-gray-900 mb-6">{t(db, "story_heading")}</h2>
              <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                <p>{t(db, "story_p1")}</p>
                <p>{t(db, "story_p2")}</p>
                <p>{t(db, "story_p3")}</p>
              </div>
            </div>
            <div className="bg-honey-dark rounded-3xl p-8 text-white">
              <div className="text-6xl mb-4">🍯</div>
              <h3 className="text-xl font-black mb-4">{t(db, "coop_heading")}</h3>
              <ul className="space-y-3 text-sm text-white/80">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-honey-bright font-bold">→</span>
                    {t(db, `coop_${i}` as keyof typeof D)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Değerlerimiz */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12">{t(db, "values_heading")}</h2>
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
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12">{t(db, "timeline_heading")}</h2>
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
          <h2 className="text-3xl font-black mb-4">{t(db, "cta_heading")}</h2>
          <p className="text-white/80 mb-8 text-sm">{t(db, "cta_text")}</p>
          <Link href="/urunlerimiz" className="btn-secondary inline-flex items-center gap-2">
            {t(db, "cta_btn")}
          </Link>
        </div>
      </section>
    </>
  );
}
