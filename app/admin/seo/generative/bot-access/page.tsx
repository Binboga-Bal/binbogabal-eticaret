export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";

interface PageProps {
  searchParams: Promise<{ botName?: string; page?: string }>;
}

export default async function BotAccessLogPage({ searchParams }: PageProps) {
  await requirePermission("seo", "view");
  const sp = await searchParams;
  const botName = sp.botName ?? "";
  const page = parseInt(sp.page ?? "1");
  const pageSize = 50;

  const where = { ...(botName ? { botName } : {}) };
  const [items, total] = await Promise.all([
    prisma.llmBotAccess.findMany({
      where,
      orderBy: { accessedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.llmBotAccess.count({ where }),
  ]);

  const botColors: Record<string, string> = {
    GPTBot: "bg-emerald-100 text-emerald-700",
    "ChatGPT-User": "bg-emerald-100 text-emerald-700",
    PerplexityBot: "bg-blue-100 text-blue-700",
    ClaudeBot: "bg-orange-100 text-orange-700",
    "anthropic-ai": "bg-orange-100 text-orange-700",
    "Google-Extended": "bg-red-100 text-red-700",
    Amazonbot: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-xl font-bold text-gray-900">LLM Bot Erişim Logu</h1>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <span className="text-sm text-gray-600">{total} kayıt</span>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Bot</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">URL</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Zaman</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${botColors[item.botName] ?? "bg-gray-100 text-gray-600"}`}>
                    {item.botName}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{item.url}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${item.statusCode < 400 ? "text-green-600" : "text-red-500"}`}>
                    {item.statusCode}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {item.accessedAt.toLocaleString("tr-TR")}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">Bot erişimi kaydedilmedi</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
