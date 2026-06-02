import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "campaigns", "update")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const { variantId } = await req.json();

  await prisma.campaignABTest.updateMany({
    where: { campaignId: id },
    data: { isWinner: false },
  });
  const winner = await prisma.campaignABTest.update({
    where: { id: variantId },
    data: { isWinner: true },
  });

  return NextResponse.json(winner);
}
