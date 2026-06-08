export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { PageContentManager } from "@/components/admin/PageContentManager";

export const metadata = { title: "Ürünlerimiz Sayfası | Admin" };

const D = {
  hero_text1: "Arıcıdan Aracısız",
  hero_text2: "Kooperatif Tecrübesiyle",
} as const;

const PFX = "page_urunlerimiz_";
const ALL_KEYS = [
  ...(Object.keys(D) as (keyof typeof D)[]).map((k) => `${PFX}${k}`),
  "banner_urunlerimiz",
];

export default async function UrunlerimizIcerigi() {
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
      description: "Ürünlerimiz sayfasının üst banner görseli. Önerilen boyut 1920 × 600 px.",
      images: [
        {
          key: "banner_urunlerimiz",
          label: "Ürünlerimiz Banneri",
          hint: "/urunlerimiz",
          currentUrl: db.banner_urunlerimiz ?? "/images/urunlerimiz/urunlerimiz-banner.webp",
          recommendedSize: "1920 × 600 px",
        },
      ],
    },
    {
      id: "hero",
      title: "Hero Yazıları",
      description: "Banner görselinin üzerindeki iki satır dekoratif metin (script fontlu).",
      texts: [
        tf("hero_text1", "Büyük Metin (1. satır)"),
        tf("hero_text2", "Küçük Metin / Alt Satır (2. satır)"),
      ],
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Ürünlerimiz Sayfası</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ürünlerimiz sayfasının statik içeriklerini buradan yönetin.
        </p>
      </div>
      <PageContentManager sections={sections} />
    </div>
  );
}
