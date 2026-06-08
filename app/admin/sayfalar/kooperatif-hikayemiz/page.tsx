export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { PageContentManager } from "@/components/admin/PageContentManager";

export const metadata = { title: "Kooperatif Hikayemiz Sayfası | Admin" };

const KEYS = ["banner_kooperatif_hikayemiz"];

export default async function KooperatifHikayemizIcerigi() {
  await requirePermission("media", "view");
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: KEYS } } });
  const db = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const sections = [
    {
      id: "banner",
      title: "Sayfa Banneri",
      description: "Kooperatif Hikayemiz sayfasının üst banner görseli.",
      images: [
        {
          key: "banner_kooperatif_hikayemiz",
          label: "Kooperatif Hikayemiz Banneri",
          hint: "/kooperatif-hikayemiz",
          currentUrl: db.banner_kooperatif_hikayemiz ?? null,
          recommendedSize: "1920 × 600 px",
        },
      ],
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Kooperatif Hikayemiz Sayfası</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kooperatif Hikayemiz sayfasının statik içeriklerini buradan yönetin.
        </p>
      </div>
      <PageContentManager sections={sections} />
    </div>
  );
}
