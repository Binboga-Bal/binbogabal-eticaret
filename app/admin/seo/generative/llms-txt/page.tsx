export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { generateLlmsTxt } from "@/lib/seo/generative/llms-txt-generator";
import Link from "next/link";

export default async function LlmsTxtPage() {
  await requirePermission("seo", "view");
  const content = await generateLlmsTxt("tr");

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">llms.txt Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">ChatGPT ve Perplexity gibi LLM botlarının okuduğu site özeti</p>
        </div>
        <div className="flex gap-2">
          <Link href="/llms.txt" target="_blank" className="text-sm text-violet-600 border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-50">
            Canlı önizleme ↗
          </Link>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        Bu içerik DB&apos;den dinamik üretilmektedir. Ürün, kategori ve kampanya değişikliklerinde otomatik güncellenir.
        Cron ile günlük yenilenebilir.
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">Önizleme (tr)</span>
          <span className="text-xs text-gray-400">{content.split("\n").length} satır</span>
        </div>
        <pre className="p-4 text-xs text-gray-700 overflow-auto max-h-[600px] whitespace-pre-wrap">{content}</pre>
      </div>
    </div>
  );
}
