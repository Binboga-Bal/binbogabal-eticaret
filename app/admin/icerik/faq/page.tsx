export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { FaqManager } from "@/components/admin/FaqManager";

export const metadata = { title: "SSS Yönetimi | Admin" };

export default async function AdminFaqPage() {
  await requirePermission("content", "view");
  const faqs = await prisma.fAQ.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-gray-900">Sık Sorulan Sorular (SSS)</h1>
      <FaqManager initialFaqs={faqs} />
    </div>
  );
}
