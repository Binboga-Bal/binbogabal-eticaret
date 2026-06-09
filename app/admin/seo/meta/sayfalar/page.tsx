export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { STATIC_PAGES } from "@/lib/seo/static-pages";
import { SeedPagesButton } from "@/components/admin/seo/SeedPagesButton";
import { CheckCircle, AlertCircle, Plus } from "lucide-react";

export const metadata = { title: "Statik Sayfa SEO | Admin" };

export default async function StaticPagesSeoPage() {
  await requirePermission("seo", "view");

  const existingMeta = await prisma.seoMeta.findMany({
    where: { entityType: "page", locale: "tr" },
    select: { entityId: true, title: true, description: true, seoScore: true, updatedAt: true },
  });

  const metaMap = new Map(existingMeta.map((m) => [m.entityId, m]));

  const scoreColor = (score: number | null) => {
    if (!score) return "bg-gray-100 text-gray-400";
    if (score >= 71) return "bg-green-100 text-green-700";
    if (score >= 41) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  const withMeta = STATIC_PAGES.filter((p) => metaMap.has(p.id)).length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Statik Sayfa SEO</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {withMeta} / {STATIC_PAGES.length} sayfanın SEO meta verisi tanımlı
          </p>
        </div>
        <SeedPagesButton missingCount={STATIC_PAGES.length - withMeta} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Sayfa</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">URL</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 max-w-xs">Başlık</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">SEO Skoru</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Son Güncelleme</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {STATIC_PAGES.map((page) => {
              const meta = metaMap.get(page.id);
              return (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {meta ? (
                        <CheckCircle size={15} className="text-green-500 shrink-0" />
                      ) : (
                        <AlertCircle size={15} className="text-amber-400 shrink-0" />
                      )}
                      <span className="font-medium text-gray-900">{page.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{page.path}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                    {meta?.title ?? (
                      <span className="italic text-gray-400">{page.defaultTitle}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${scoreColor(meta?.seoScore ?? null)}`}>
                      {meta?.seoScore ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {meta ? meta.updatedAt.toLocaleDateString("tr-TR") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/seo/meta/page/${page.id}`}
                      className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-800 text-xs font-medium"
                    >
                      {meta ? "Düzenle" : <><Plus size={12} /> Oluştur</>}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
