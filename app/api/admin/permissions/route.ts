import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "roles", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const permissions = await prisma.permission.findMany({ orderBy: [{ module: "asc" }, { action: "asc" }] });

  // Group by module
  const grouped = permissions.reduce<Record<string, typeof permissions>>((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  return NextResponse.json({ permissions, grouped });
}
