import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ entityType: string; entityId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { entityType, entityId } = await params;

  const records = await prisma.seoMeta.findMany({
    where: { entityType, entityId },
    orderBy: { locale: "asc" },
  });

  return NextResponse.json(records);
}
