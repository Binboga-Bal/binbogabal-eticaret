export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { isAiEnabled } from "@/lib/seo/ai/client";

export default async function AiJobsPage() {
  await requirePermission("seo", "view");

  const aiEnabled = isAiEnabled();

  const [jobs, statusCounts] = await Promise.all([
    prisma.aiSeoJob.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.aiSeoJob.groupBy({ by: ["status"], _count: true }),
  ]);

  const counts = Object.fromEntries(statusCounts.map((c) => [c.status, c._count]));

  const statusStyles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    RUNNING: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">AI SEO İş Kuyruğu</h1>
        {!aiEnabled && (
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            ⚠ <code>ANTHROPIC_API_KEY</code> tanımlı değil. AI özellikleri pasif.
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {["PENDING", "RUNNING", "COMPLETED", "FAILED"].map((s) => (
          <div key={s} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-gray-900">{counts[s] ?? 0}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusStyles[s]}`}>{s}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">İş Tipi</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Varlık</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Dil</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Token</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tarih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{job.jobType}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{job.entityType}/{job.entityId?.slice(0, 8)}</td>
                <td className="px-4 py-3 text-xs text-gray-500 uppercase">{job.locale}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusStyles[job.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-gray-500">{job.tokensUsed ?? "-"}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{job.createdAt.toLocaleString("tr-TR")}</td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Henüz iş yok</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
