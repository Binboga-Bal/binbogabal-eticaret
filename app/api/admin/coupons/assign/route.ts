import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

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
