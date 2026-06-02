import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";

const schema = z.object({
  ips: z.array(z.object({ ipRange: z.string(), label: z.string().optional() })),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "admin_users", "update")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });

  await prisma.adminAllowedIP.deleteMany({ where: { userId: id } });
  if (parsed.data.ips.length > 0) {
    await prisma.adminAllowedIP.createMany({
      data: parsed.data.ips.map((ip) => ({ userId: id, ...ip, createdBy: session.adminId })),
    });
  }

  const result = await prisma.adminAllowedIP.findMany({ where: { userId: id } });
  return NextResponse.json(result);
}
