export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Bot, Cpu, Link2, BarChart2 } from "lucide-react";

export default async function GenerativeSeoDashboardPage() {
  await requirePermission("seo", "view");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalMentions, mentionedCount, botAccessByBot, avgLlmScore, lowLlmCount] = await Promise.all([
    prisma.llmMention.count(),
    prisma.llmMention.count({ where: { mentioned: true } }),
    prisma.llmBotAccess.groupBy({
      by: ["botName"],
      _count: true,
      where: { accessedAt: { gte: thirtyDaysAgo } },
      orderBy: { _count: { botName: "desc" } },
    }),
    prisma.seoMeta.aggregate({ _avg: { llmScore: true } }),
    prisma.seoMeta.count({ where: { llmScore: { lt: 41 } } }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Generative SEO Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">ChatGPT, Perplexity, Gemini, Claude alıntı takibi</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Toplam LLM Sorgusu", value: totalMentions, icon: <Bot size={20} />, color: "bg-violet-50 text-violet-600" },
          { label: "Alıntılanan Sorgu", value: mentionedCount, icon: <Link2 size={20} />, color: "bg-green-50 text-green-600" },
          { label: "Ort. LLM Skoru", value: Math.round(avgLlmScore._avg.llmScore ?? 0), icon: <BarChart2 size={20} />, color: "bg-blue-50 text-blue-600" },
          { label: "Düşük LLM Skoru", value: lowLlmCount, icon: <Bot size={20} />, color: "bg-red-50 text-red-600" },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}>{card.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Bot erişim dağılımı */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Cpu size={16} /> LLM Bot Erişimi (Son 30 Gün)
        </h2>
        {botAccessByBot.length === 0 ? (
          <p className="text-sm text-gray-400">Henüz bot erişimi kaydedilmedi</p>
        ) : (
          <div className="space-y-2">
            {botAccessByBot.map((b) => {
              const max = botAccessByBot[0]._count;
              const pct = Math.round((b._count / max) * 100);
              return (
                <div key={b.botName} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 w-36 shrink-0">{b.botName}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-violet-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">{b._count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Link href="/admin/seo/generative/bot-access" className="text-sm text-violet-600 hover:underline">Bot Erişim Logu →</Link>
        <Link href="/admin/seo/generative/llms-txt" className="text-sm text-violet-600 hover:underline">llms.txt Yönetimi →</Link>
        <Link href="/admin/seo/meta" className="text-sm text-violet-600 hover:underline">LLM Skoru Düşük Sayfalar →</Link>
      </div>
    </div>
  );
}
