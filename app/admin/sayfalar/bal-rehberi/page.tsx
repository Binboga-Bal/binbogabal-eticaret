export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { PageContentManager } from "@/components/admin/PageContentManager";
import { balRehberiTheme } from "@/lib/theme";

export const metadata = { title: "Bal Rehberi Sayfası | Admin" };

const D = {
  hero_text1: "Her Damlasında Doğanın Binlerce Emeği Saklı...",
  hero_text2: "Binlerce Arının, Binlerce Arıcının, Binlerce Çiçeğin Özü...",
  guvence_heading: "Bal Bilgisi, Kooperatif Güvencesiyle",
  guvence_text:
    "1973'ten beri kooperatif çatısı altında biriken binlerce arıcı, bilimsel analizler ve şeffaf üretim modelimizle bal konusundaki uzmanlığımızı sizlerle paylaşıyoruz.",
  cta_heading: "Rehberden Sofraya: Size Uygun Balı Keşfedin",
  cta_text: "Bal Rehberi'nde edindiğiniz bilgiyle ürünlerimize göz atın ve sağlıklı alışveriş yapın.",
  cta_btn_1: "Ürünleri İncele",
  cta_btn_2: "Kooperatif Hikayesi",
} as const;

const PFX = "page_balrehberi_";
const ALL_KEYS = [
  ...(Object.keys(D) as (keyof typeof D)[]).map((k) => `${PFX}${k}`),
  "banner_bal_rehberi",
  "img_bal_rehberi_guvence",
];

export default async function BalRehberiIcerigi() {
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
      description: "Bal Rehberi sayfasının üst banner görseli.",
      images: [
        {
          key: "banner_bal_rehberi",
          label: "Bal Rehberi Banneri",
          hint: "/bal-rehberi",
          currentUrl: db.banner_bal_rehberi ?? balRehberiTheme.banner.image,
          recommendedSize: "1920 × 600 px",
        },
      ],
    },
    {
      id: "hero",
      title: "Hero Yazıları",
      description: "Banner görselinin üzerindeki iki satır metin.",
      texts: [
        tf("hero_text1", "Büyük Metin (1. satır)"),
        tf("hero_text2", "Küçük Metin (2. satır)"),
      ],
    },
    {
      id: "guvence",
      title: "Güvence Bölümü",
      description: "Kooperatif güvencesi bölümünün arka plan görseli, başlık ve açıklaması.",
      images: [
        {
          key: "img_bal_rehberi_guvence",
          label: "Güvence Bölümü Arka Planı",
          hint: "Kooperatif güvencesi bölümü",
          currentUrl: db.img_bal_rehberi_guvence ?? "/images/bal-rehberi/bal-rehberi-kooperatif-guvencesi.jpg",
          recommendedSize: "1920 × 600 px",
        },
      ],
      texts: [
        tf("guvence_heading", "Başlık"),
        tf("guvence_text",    "Açıklama Metni", "textarea", 3),
      ],
    },
    {
      id: "cta",
      title: "CTA Kutusu (alt)",
      description: "Sayfanın altındaki popüler rehberler bölümünün altındaki çağrı kutusu.",
      texts: [
        tf("cta_heading", "Başlık"),
        tf("cta_text",    "Açıklama Metni", "textarea", 2),
        tf("cta_btn_1",   "1. Buton Metni"),
        tf("cta_btn_2",   "2. Buton Metni"),
      ],
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Bal Rehberi Sayfası</h1>
        <p className="text-sm text-gray-500 mt-1">
          Bal Rehberi sayfasının tüm statik içeriklerini buradan yönetin.
        </p>
      </div>
      <PageContentManager sections={sections} />
    </div>
  );
}
