export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { PageContentManager } from "@/components/admin/PageContentManager";

export const metadata = { title: "Hakkımızda Sayfası | Admin" };

const D = {
  hero_tag: "1973'ten Bugüne",
  hero_h1: "Şirket Değil, Kooperatif!",
  hero_subtitle: "Kozan dağlarının arıcıları 50 yılı aşkın süredir tek bir amaç etrafında birleşiyor: doğal balı, adil bir fiyatla, doğrudan sizin sofranıza taşımak.",
  stat_1_value: "1973",  stat_1_label: "Kuruluş Yılı",
  stat_2_value: "1800+", stat_2_label: "Arıcı Üye",
  stat_3_value: "50+",   stat_3_label: "Yıllık Deneyim",
  stat_4_value: "%100",  stat_4_label: "Doğal Bal",
  story_heading: "Hikayemiz",
  story_p1: "1973 yılında, Adana'nın Kozan ilçesinde birkaç arıcı aile bir karar verdi. Tek başına ayakta kalmanın zor olduğunu biliyorlardı. İşte o gün, yükü paylaşmak için bir araya geldiler. S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi böyle doğdu.",
  story_p2: "Bugün 1800'den fazla arıcı üyesiyle Türkiye'nin en köklü bal kooperatiflerinden biriyiz. Toroslar'ın endemik çiçeklerinden — kekik, keven, narenciye, çalıkuşu — beslenen arılarımız yılda iki sezon hasat verir.",
  story_p3: "Ama en önemli farkımız bu değil. En önemli farkımız şu: kâr amacımız yok. Kooperatif yapımız sayesinde arıcılarımıza piyasa fiyatının üzerinde ödeme yapıyor, tüketicilere de aracı komisyonu olmadan ulaşıyoruz.",
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
const ALL_KEYS = [...(Object.keys(D) as (keyof typeof D)[]).map((k) => `${PFX}${k}`), "banner_hakkimizda"];

export default async function HakkimizdaAdmin() {
  await requirePermission("media", "view");
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: ALL_KEYS } } });
  const db = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  function tf(key: string, label: string, type: "text" | "textarea" = "text", rows?: number) {
    return {
      key: `${PFX}${key}`,
      label,
      type,
      defaultValue: (D as Record<string, string>)[key] ?? "",
      currentValue: db[`${PFX}${key}`] ?? null,
      rows,
    };
  }

  const sections = [
    {
      id: "banner",
      title: "Sayfa Banneri",
      description: "Hakkımızda sayfasının üst banner görseli.",
      images: [{ key: "banner_hakkimizda", label: "Hakkımızda Banneri", hint: "/hakkimizda", currentUrl: db.banner_hakkimizda ?? null, recommendedSize: "1920 × 600 px" }],
    },
    {
      id: "hero",
      title: "Hero Bölümü",
      description: "Banner üzerindeki etiket, başlık ve alt metin.",
      texts: [
        tf("hero_tag", "Etiket (küçük üst yazı)"),
        tf("hero_h1", "Ana Başlık (H1)"),
        tf("hero_subtitle", "Alt Metin", "textarea", 2),
      ],
    },
    {
      id: "stats",
      title: "İstatistikler",
      description: "Sayfanın üst kısmındaki 4 istatistik kutusu.",
      texts: [1, 2, 3, 4].flatMap((i) => [
        tf(`stat_${i}_value`, `İstatistik ${i} — Değer`),
        tf(`stat_${i}_label`, `İstatistik ${i} — Etiket`),
      ]),
    },
    {
      id: "story",
      title: "Hikayemiz Bölümü",
      description: "Sol sütundaki hikaye metinleri ve sağdaki kooperatif bilgi kartı.",
      texts: [
        tf("story_heading", "Bölüm Başlığı"),
        tf("story_p1", "1. Paragraf", "textarea", 3),
        tf("story_p2", "2. Paragraf", "textarea", 3),
        tf("story_p3", "3. Paragraf", "textarea", 3),
        tf("coop_heading", "Kart Başlığı (Kooperatif neden önemli?)"),
        tf("coop_1", "Kart Madde 1"),
        tf("coop_2", "Kart Madde 2"),
        tf("coop_3", "Kart Madde 3"),
        tf("coop_4", "Kart Madde 4"),
      ],
    },
    {
      id: "values",
      title: "Değerlerimiz",
      description: "4 değer kartının başlık ve açıklamaları.",
      texts: [
        tf("values_heading", "Bölüm Başlığı"),
        ...[1, 2, 3, 4].flatMap((i) => [
          tf(`value_${i}_title`, `Değer ${i} — Başlık`),
          tf(`value_${i}_desc`,  `Değer ${i} — Açıklama`, "textarea", 2),
        ]),
      ],
    },
    {
      id: "timeline",
      title: "Tarihçemiz",
      description: "7 tarihsel kilometre taşı.",
      texts: [
        tf("timeline_heading", "Bölüm Başlığı"),
        ...[1, 2, 3, 4, 5, 6, 7].flatMap((i) => [
          tf(`timeline_${i}_year`,  `Kilometre Taşı ${i} — Yıl`),
          tf(`timeline_${i}_event`, `Kilometre Taşı ${i} — Olay`, "textarea", 2),
        ]),
      ],
    },
    {
      id: "cta",
      title: "CTA Bölümü",
      description: "Sayfanın alt kısmındaki çağrı kutusu.",
      texts: [
        tf("cta_heading", "Başlık"),
        tf("cta_text",    "Açıklama Metni", "textarea", 2),
        tf("cta_btn",     "Buton Metni"),
      ],
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Hakkımızda Sayfası</h1>
        <p className="text-sm text-gray-500 mt-1">
          Hakkımızda sayfasının tüm statik içeriklerini buradan yönetin.
        </p>
      </div>
      <PageContentManager sections={sections} />
    </div>
  );
}
