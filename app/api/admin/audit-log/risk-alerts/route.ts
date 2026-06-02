import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !session.isSuperAdmin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const logs = await prisma.auditLog.findMany({
    where: { riskScore: { gte: 50 } },
    take: 100,
    orderBy: [{ riskScore: "desc" }, { createdAt: "desc" }],
    include: { admin: { select: { name: true, email: true } } },
  });

  return NextResponse.json(logs);
}
