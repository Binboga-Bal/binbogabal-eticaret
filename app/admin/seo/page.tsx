export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Search, Bot, FileText, Link2, BarChart2, Cpu, RefreshCw } from "lucide-react";

async function getOverview() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [totalMeta, highSeo, lowSeo, highLlm, lowLlm, totalBotAccess, totalRedirects, totalKeywords, pendingJobs] = await Promise.all([
    prisma.seoMeta.count(),
    prisma.seoMeta.count({ where: { seoScore: { gte: 71 } } }),
    prisma.seoMeta.count({ where: { seoScore: { lt: 41 } } }),
    prisma.seoMeta.count({ where: { llmScore: { gte: 71 } } }),
    prisma.seoMeta.count({ where: { llmScore: { lt: 41 } } }),
    prisma.llmBotAccess.count({ where: { accessedAt: { gte: thirtyDaysAgo } } }),
    prisma.redirect.count({ where: { isActive: true } }),
    prisma.keywordTracking.count({ where: { isActive: true } }),
    prisma.aiSeoJob.count({ where: { status: "PENDING" } }),
  ]);
  return { totalMeta, highSeo, lowSeo, highLlm, lowLlm, totalBotAccess, totalRedirects, totalKeywords, pendingJobs };
}

export default async function SeoDashboardPage() {
  await requirePermission("seo", "view");
  const stats = await getOverview();

  const cards = [
    { title: "SEO Meta Kaydı", value: stats.totalMeta, href: "/admin/seo/meta", icon: <Search size={22} />, color: "blue" },
    { title: "Yüksek SEO Skoru", value: stats.highSeo, href: "/admin/seo/meta", icon: <BarChart2 size={22} />, color: "green" },
    { title: "Düşük SEO Skoru", value: stats.lowSeo, href: "/admin/seo/meta", icon: <BarChart2 size={22} />, color: "red" },
    { title: "Yüksek LLM Skoru", value: stats.highLlm, href: "/admin/seo/generative", icon: <Bot size={22} />, color: "violet" },
    { title: "Düşük LLM Skoru", value: stats.lowLlm, href: "/admin/seo/generative", icon: <Bot size={22} />, color: "orange" },
    { title: "LLM Bot Ziyareti (30g)", value: stats.totalBotAccess, href: "/admin/seo/generative/bot-access", icon: <Cpu size={22} />, color: "cyan" },
    { title: "Aktif Redirect", value: stats.totalRedirects, href: "/admin/seo/redirects", icon: <Link2 size={22} />, color: "slate" },
    { title: "Takipli Anahtar K.", value: stats.totalKeywords, href: "/admin/seo/keywords", icon: <FileText size={22} />, color: "indigo" },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    violet: "bg-violet-50 text-violet-600",
    orange: "bg-orange-50 text-orange-600",
    cyan: "bg-cyan-50 text-cyan-600",
    slate: "bg-slate-50 text-slate-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO & GEO Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Geleneksel SEO + Generative SEO (GEO) merkezi</p>
        </div>
        <div className="flex gap-2">
          {stats.pendingJobs > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <RefreshCw size={12} className="animate-spin" />
              {stats.pendingJobs} AI işi bekliyor
            </span>
          )}
          <Link href="/admin/seo/meta/ai-generate-bulk" className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">
            Toplu AI Optimize
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow group">
            <div className={`w-10 h-10 rounded-lg ${colorMap[card.color]} flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5 group-hover:text-gray-700">{card.title}</p>
          </Link>
        ))}
      </div>

      {/* Hızlı Erişim */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Geleneksel SEO */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Search size={16} /> Geleneksel SEO
          </h2>
          <div className="space-y-2">
            {[
              { href: "/admin/seo/meta", label: "Meta Listesi & Editör" },
              { href: "/admin/seo/templates", label: "SEO Şablonları" },
              { href: "/admin/seo/keywords", label: "Anahtar Kelime Takibi" },
              { href: "/admin/seo/redirects", label: "Yönlendirme Yönetimi" },
              { href: "/admin/seo/technical/robots", label: "Robots.txt Düzenle" },
              { href: "/admin/seo/technical/sitemap", label: "Sitemap Yapılandır" },
              { href: "/admin/seo/reports", label: "SEO Raporları" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 group">
                {item.label}
                <span className="text-gray-300 group-hover:text-gray-500">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Generative SEO */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bot size={16} /> Generative SEO (GEO)
          </h2>
          <div className="space-y-2">
            {[
              { href: "/admin/seo/generative", label: "Generative Dashboard" },
              { href: "/admin/seo/generative/llms-txt", label: "llms.txt Yönetimi" },
              { href: "/admin/seo/generative/bot-access", label: "LLM Bot Erişim Logu" },
              { href: "/admin/seo/ai/jobs", label: "AI İş Kuyruğu (SSE)" },
              { href: "/llms.txt", label: "llms.txt Önizleme ↗", target: "_blank" as const },
            ].map((item) => (
              <Link key={item.href} href={item.href} target={(item as { target?: string }).target} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 group">
                {item.label}
                <span className="text-gray-300 group-hover:text-gray-500">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
