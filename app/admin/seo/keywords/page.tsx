export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { KeywordsManager } from "@/components/admin/seo/KeywordsManager";

export default async function KeywordsPage() {
  await requirePermission("seo", "view");
  const keywords = await prisma.keywordTracking.findMany({
    where: { isActive: true },
    include: { rankings: { orderBy: { recordedAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Anahtar Kelime Takibi</h1>
        <p className="text-sm text-gray-500 mt-1">Takip etmek istediğiniz anahtar kelimeleri ekleyin. Sıralama verisi GSC entegrasyonu ile gelecek.</p>
      </div>
      <KeywordsManager initialKeywords={JSON.parse(JSON.stringify(keywords))} />
    </div>
  );
}
