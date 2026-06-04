export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import { RedirectsManager } from "@/components/admin/seo/RedirectsManager";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function RedirectsPage({ searchParams }: PageProps) {
  await requirePermission("seo", "view");
  const sp = await searchParams;
  const q = sp.q ?? "";
  const page = parseInt(sp.page ?? "1");
  const pageSize = 50;

  const where = { ...(q ? { fromPath: { contains: q, mode: "insensitive" as const } } : {}) };
  const [items, total] = await Promise.all([
    prisma.redirect.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.redirect.count({ where }),
  ]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Yönlendirme Yönetimi</h1>
      </div>
      <RedirectsManager initialItems={JSON.parse(JSON.stringify(items))} total={total} page={page} q={q} />
    </div>
  );
}
