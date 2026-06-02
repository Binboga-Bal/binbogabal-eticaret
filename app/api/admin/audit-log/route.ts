import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "audit_log", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const adminId = searchParams.get("adminId") ?? undefined;
  const module = searchParams.get("module") ?? undefined;
  const action = searchParams.get("action") ?? undefined;
  const minRisk = parseInt(searchParams.get("minRisk") ?? "0");
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const where = {
    ...(adminId ? { adminId } : {}),
    ...(module ? { module } : {}),
    ...(action ? { action } : {}),
    ...(minRisk > 0 ? { riskScore: { gte: minRisk } } : {}),
    ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { name: true, email: true, avatarUrl: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, page, limit, totalPages: Math.ceil(total / limit) });
}
