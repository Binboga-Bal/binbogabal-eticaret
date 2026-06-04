export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, Plus, Sparkles } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string; entityType?: string; locale?: string; page?: string }>;
}

export default async function SeoMetaListPage({ searchParams }: PageProps) {
  await requirePermission("seo", "view");
  const sp = await searchParams;
  const q = sp.q ?? "";
  const entityType = sp.entityType ?? "";
  const locale = sp.locale ?? "tr";
  const page = parseInt(sp.page ?? "1");
  const pageSize = 50;

  const where = {
    locale,
    ...(entityType ? { entityType } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.seoMeta.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.seoMeta.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  const scoreColor = (score: number | null) => {
    if (!score) return "bg-gray-100 text-gray-500";
    if (score >= 71) return "bg-green-100 text-green-700";
    if (score >= 41) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">SEO Meta Yönetimi</h1>
        <Link href="/admin/seo/meta/ai-generate-bulk" className="inline-flex items-center gap-2 bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">
          <Sparkles size={15} /> Toplu AI Optimize
        </Link>
      </div>

      {/* Filtreler */}
      <form className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Başlığa göre ara..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>
        <select name="entityType" defaultValue={entityType} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
          <option value="">Tüm Tipler</option>
          <option value="product">Ürün</option>
          <option value="category">Kategori</option>
          <option value="blog">Blog</option>
          <option value="campaign">Kampanya</option>
          <option value="page">Sayfa</option>
        </select>
        <select name="locale" defaultValue={locale} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
        <button type="submit" className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800">
          Ara
        </button>
      </form>

      <div className="text-sm text-gray-500">{total} kayıt</div>

      {/* Tablo */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Başlık</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tip</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Dil</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">SEO</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">LLM</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Güncelleme</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                  {item.title ?? <span className="text-gray-400 italic">Başlık yok</span>}
                </td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                    {item.entityType}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 uppercase text-xs">{item.locale}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${scoreColor(item.seoScore)}`}>
                    {item.seoScore ?? "-"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${scoreColor(item.llmScore)}`}>
                    {item.llmScore ?? "-"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {item.updatedAt.toLocaleDateString("tr-TR")}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/seo/meta/${item.entityType}/${item.entityId}`}
                    className="text-violet-600 hover:text-violet-800 text-xs font-medium"
                  >
                    Düzenle
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                  Kayıt bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Sayfa {page} / {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`?page=${page - 1}&q=${q}&entityType=${entityType}&locale=${locale}`} className="px-3 py-1.5 border rounded-lg hover:bg-gray-50">
                Önceki
              </Link>
            )}
            {page < totalPages && (
              <Link href={`?page=${page + 1}&q=${q}&entityType=${entityType}&locale=${locale}`} className="px-3 py-1.5 border rounded-lg hover:bg-gray-50">
                Sonraki
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
