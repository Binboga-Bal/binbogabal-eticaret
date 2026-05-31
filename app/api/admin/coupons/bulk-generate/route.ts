import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateBulkCoupons } from "@/lib/campaign/coupon-generator";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();
  const { count, prefix, campaignId, discountType, discountValue, minOrderAmount, maxUses, perCustomerLimit, expiresAt } = body;

  if (!count || count < 1 || count > 10000) {
    return NextResponse.json({ error: "count 1-10000 arasında olmalı" }, { status: 400 });
  }

  const result = await generateBulkCoupons({
    count,
    prefix,
    campaignId,
    discountType,
    discountValue,
    minOrderAmount,
    maxUses,
    perCustomerLimit,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
  });

  return NextResponse.json(result, { status: 201 });
}
