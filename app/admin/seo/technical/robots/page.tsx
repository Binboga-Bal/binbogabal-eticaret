export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { RobotsEditor } from "@/components/admin/seo/RobotsEditor";
import Link from "next/link";

export default async function RobotsPage() {
  await requirePermission("seo", "edit");
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Robots.txt Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">Tarayıcı ve LLM bot kuralları</p>
        </div>
        <Link href="/robots.txt" target="_blank" className="text-sm text-violet-600 border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-50">
          Canlı robots.txt ↗
        </Link>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        Mevcut robots.txt <code>/app/robots.ts</code> dosyasından dinamik üretilmektedir.
        Aşağıya özel içerik girerek geçersiz kılabilirsiniz (DB kayıtı öncelikli olmaz — bu sadece kayıt amaçlıdır).
        Gerçek değişiklik için <code>app/robots.ts</code> dosyasını düzenleyin.
      </div>
      <RobotsEditor />
    </div>
  );
}
