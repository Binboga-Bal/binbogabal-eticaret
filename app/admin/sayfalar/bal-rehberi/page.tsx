export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { PageContentManager } from "@/components/admin/PageContentManager";
import { balRehberiTheme } from "@/lib/theme";

export const metadata = { title: "Bal Rehberi Sayfası | Admin" };

const KEYS = ["banner_bal_rehberi", "img_bal_rehberi_guvence"];

export default async function BalRehberiIcerigi() {
  await requirePermission("media", "view");
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: KEYS } } });
  const db = Object.fromEntries(rows.map((r) => [r.key, r.value]));

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
      id: "guvence",
      title: "Güvence Bölümü",
      description: "Kooperatif güvencesi bölümünün arka plan görseli.",
      images: [
        {
          key: "img_bal_rehberi_guvence",
          label: "Güvence Bölümü Arka Planı",
          hint: "Kooperatif güvencesi bölümü",
          currentUrl: db.img_bal_rehberi_guvence ?? "/images/bal-rehberi/bal-rehberi-kooperatif-guvencesi.jpg",
          recommendedSize: "1920 × 600 px",
        },
      ],
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Bal Rehberi Sayfası</h1>
        <p className="text-sm text-gray-500 mt-1">
          Bal Rehberi sayfasının statik içeriklerini buradan yönetin.
        </p>
      </div>
      <PageContentManager sections={sections} />
    </div>
  );
}
