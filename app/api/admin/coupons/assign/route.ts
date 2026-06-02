import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "campaigns", "update")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { userId, couponId } = await req.json();

  const existing = await prisma.customerCoupon.findUnique({
    where: { userId_couponId: { userId, couponId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Bu kupon zaten atanmış" }, { status: 400 });
  }

  const assignment = await prisma.customerCoupon.create({
    data: { userId, couponId },
  });

  return NextResponse.json(assignment, { status: 201 });
}
