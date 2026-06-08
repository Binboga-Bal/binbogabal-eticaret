export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { PageContentManager } from "@/components/admin/PageContentManager";

export const metadata = { title: "Hakkımızda Sayfası | Admin" };

const KEYS = ["banner_hakkimizda"];

export default async function HakkimizdaIcerigi() {
  await requirePermission("media", "view");
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: KEYS } } });
  const db = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const sections = [
    {
      id: "banner",
      title: "Sayfa Banneri",
      description: "Hakkımızda sayfasının üst banner görseli.",
      images: [
        {
          key: "banner_hakkimizda",
          label: "Hakkımızda Banneri",
          hint: "/hakkimizda",
          currentUrl: db.banner_hakkimizda ?? null,
          recommendedSize: "1920 × 600 px",
        },
      ],
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Hakkımızda Sayfası</h1>
        <p className="text-sm text-gray-500 mt-1">
          Hakkımızda sayfasının statik içeriklerini buradan yönetin.
        </p>
      </div>
      <PageContentManager sections={sections} />
    </div>
  );
}
