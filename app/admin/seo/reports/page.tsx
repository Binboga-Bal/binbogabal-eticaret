export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SeoReportsPage() {
  await requirePermission("seo", "view");

  const [
    avgSeoScore, highCount, mediumCount, lowCount,
    avgLlmScore, highLlm, mediumLlm, lowLlm,
    topBots, mentionedCount, totalMentions,
  ] = await Promise.all([
    prisma.seoMeta.aggregate({ _avg: { seoScore: true } }),
    prisma.seoMeta.count({ where: { seoScore: { gte: 71 } } }),
    prisma.seoMeta.count({ where: { seoScore: { gte: 41, lt: 71 } } }),
    prisma.seoMeta.count({ where: { seoScore: { lt: 41 } } }),
    prisma.seoMeta.aggregate({ _avg: { llmScore: true } }),
    prisma.seoMeta.count({ where: { llmScore: { gte: 71 } } }),
    prisma.seoMeta.count({ where: { llmScore: { gte: 41, lt: 71 } } }),
    prisma.seoMeta.count({ where: { llmScore: { lt: 41 } } }),
    prisma.llmBotAccess.groupBy({
      by: ["botName"], _count: true,
      where: { accessedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      orderBy: { _count: { botName: "desc" } }, take: 5,
    }),
    prisma.llmMention.count({ where: { mentioned: true } }),
    prisma.llmMention.count(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">SEO Raporları</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Geleneksel SEO */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Geleneksel SEO Skor Dağılımı</h2>
          <div className="text-center mb-4">
            <p className="text-4xl font-black text-gray-900">{Math.round(avgSeoScore._avg.seoScore ?? 0)}</p>
            <p className="text-sm text-gray-500">Ortalama SEO Skoru</p>
          </div>
          <div className="space-y-2">
            {[
              { label: "Yüksek (71-100)", count: highCount, color: "bg-green-400" },
              { label: "Orta (41-70)", count: mediumCount, color: "bg-amber-400" },
              { label: "Düşük (0-40)", count: lowCount, color: "bg-red-400" },
            ].map((item) => {
              const total = highCount + mediumCount + lowCount || 1;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-28 shrink-0">{item.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${(item.count / total) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-8 text-right">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Generative SEO */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Generative SEO (LLM) Skor Dağılımı</h2>
          <div className="text-center mb-4">
            <p className="text-4xl font-black text-gray-900">{Math.round(avgLlmScore._avg.llmScore ?? 0)}</p>
            <p className="text-sm text-gray-500">Ortalama LLM Skoru</p>
          </div>
          <div className="space-y-2">
            {[
              { label: "Yüksek (71-100)", count: highLlm, color: "bg-violet-400" },
              { label: "Orta (41-70)", count: mediumLlm, color: "bg-blue-400" },
              { label: "Düşük (0-40)", count: lowLlm, color: "bg-gray-400" },
            ].map((item) => {
              const total = highLlm + mediumLlm + lowLlm || 1;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-28 shrink-0">{item.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${(item.count / total) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-8 text-right">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* LLM Alıntı */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">LLM Alıntı Özeti</h2>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-black text-gray-900">{mentionedCount}</p>
              <p className="text-xs text-gray-500">Alıntılanan</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-gray-900">{totalMentions}</p>
              <p className="text-xs text-gray-500">Toplam Sorgu</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-gray-900">
                {totalMentions > 0 ? Math.round((mentionedCount / totalMentions) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500">Görünürlük</p>
            </div>
          </div>
        </div>

        {/* Top Botlar */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">En Aktif LLM Botları (30g)</h2>
          {topBots.length === 0 ? (
            <p className="text-sm text-gray-400">Henüz bot erişimi yok</p>
          ) : (
            <div className="space-y-2">
              {topBots.map((b) => (
                <div key={b.botName} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{b.botName}</span>
                  <span className="text-sm font-bold text-gray-900">{b._count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
