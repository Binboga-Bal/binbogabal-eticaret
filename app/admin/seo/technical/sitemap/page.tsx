export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SitemapPage() {
  await requirePermission("seo", "view");

  const [productCount, categoryCount, blogCount, campaignCount] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.blogPost.count({ where: { isPublished: true } }),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
  ]);

  const sections = [
    { type: "Ürünler", count: productCount, changeFreq: "weekly", priority: "0.8" },
    { type: "Kategoriler", count: categoryCount, changeFreq: "weekly", priority: "0.7" },
    { type: "Blog Yazıları", count: blogCount, changeFreq: "monthly", priority: "0.6" },
    { type: "Kampanyalar", count: campaignCount, changeFreq: "daily", priority: "0.7" },
    { type: "Statik Sayfalar", count: 10, changeFreq: "monthly", priority: "0.5" },
  ];

  const total = productCount + categoryCount + blogCount + campaignCount + 10;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sitemap Yapılandırması</h1>
          <p className="text-sm text-gray-500 mt-1">Toplam {total} URL indekslenecek</p>
        </div>
        <Link href="/sitemap.xml" target="_blank" className="text-sm text-violet-600 border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-50">
          sitemap.xml ↗
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Bölüm</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">URL Sayısı</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Değişim Sıklığı</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Öncelik</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sections.map((s) => (
              <tr key={s.type} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{s.type}</td>
                <td className="px-4 py-3 text-right text-gray-700">{s.count}</td>
                <td className="px-4 py-3 text-gray-500">{s.changeFreq}</td>
                <td className="px-4 py-3 text-gray-500">{s.priority}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-gray-200 bg-gray-50">
            <tr>
              <td className="px-4 py-3 font-bold text-gray-900">Toplam</td>
              <td className="px-4 py-3 text-right font-bold text-gray-900">{total}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        Sitemap <code>/app/sitemap.ts</code> dosyasından ISR (24 saatte bir) ile otomatik üretilmektedir.
        Ürün/kategori değişikliklerinde ERP senkronu da sitemap&apos;ı günceller.
      </div>
    </div>
  );
}
