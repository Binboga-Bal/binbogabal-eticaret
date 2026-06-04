export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { TemplatesManager } from "@/components/admin/seo/TemplatesManager";

export default async function TemplatesPage() {
  await requirePermission("seo", "view");
  const templates = await prisma.seoTemplate.findMany({ orderBy: [{ entityType: "asc" }, { locale: "asc" }] });
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">SEO Şablonları</h1>
        <p className="text-sm text-gray-500 mt-1">
          Toplu AI üretimi için başlık ve açıklama şablonları. Değişkenler: {`{{name}}`}, {`{{category}}`}, {`{{price}}`}, {`{{brand}}`}
        </p>
      </div>
      <TemplatesManager initialTemplates={JSON.parse(JSON.stringify(templates))} />
    </div>
  );
}
