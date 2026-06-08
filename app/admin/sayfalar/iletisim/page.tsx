export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { PageContentManager } from "@/components/admin/PageContentManager";

export const metadata = { title: "İletişim Sayfası | Admin" };

const KEYS = ["banner_iletisim"];

export default async function IletisimIcerigi() {
  await requirePermission("media", "view");
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: KEYS } } });
  const db = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const sections = [
    {
      id: "banner",
      title: "Sayfa Banneri",
      description: "İletişim sayfasının üst banner görseli.",
      images: [
        {
          key: "banner_iletisim",
          label: "İletişim Banneri",
          hint: "/iletisim",
          currentUrl: db.banner_iletisim ?? null,
          recommendedSize: "1920 × 600 px",
        },
      ],
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">İletişim Sayfası</h1>
        <p className="text-sm text-gray-500 mt-1">
          İletişim sayfasının statik içeriklerini buradan yönetin.
        </p>
      </div>
      <PageContentManager sections={sections} />
    </div>
  );
}
