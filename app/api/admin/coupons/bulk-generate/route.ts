import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { generateBulkCoupons } from "@/lib/campaign/coupon-generator";
import { logAction } from "@/lib/audit/logger";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "campaigns", "create")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

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

  await logAction({ adminId: session.adminId, action: "bulk_generate", module: "coupons", targetId: campaignId ?? undefined, targetLabel: `${count} kupon (prefix: ${prefix ?? "-"})`, newData: { count, prefix, discountType, discountValue }, req });

  return NextResponse.json(result, { status: 201 });
}
