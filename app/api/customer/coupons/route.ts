import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/customer-auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const coupons = await prisma.customerCoupon.findMany({
    where: { userId: user.id },
    include: { coupon: true },
    orderBy: { assignedAt: "desc" },
  });

  return NextResponse.json(coupons);
}
