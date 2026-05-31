import { prisma } from "@/lib/prisma";

function generateCode(prefix: string, length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = prefix ? `${prefix}-` : "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function generateBulkCoupons(params: {
  count: number;
  prefix?: string;
  campaignId?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  perCustomerLimit?: number;
  expiresAt?: Date;
}): Promise<{ created: number; codes: string[] }> {
  const codes: string[] = [];
  const batchSize = 100;

  let created = 0;
  for (let i = 0; i < params.count; i += batchSize) {
    const batch = Math.min(batchSize, params.count - i);
    const batchCodes: string[] = [];

    for (let j = 0; j < batch; j++) {
      let code: string;
      let attempts = 0;
      do {
        code = generateCode(params.prefix ?? "", 8);
        attempts++;
        if (attempts > 10) throw new Error("Benzersiz kod üretilemiyor");
      } while (batchCodes.includes(code));
      batchCodes.push(code);
    }

    // Veritabanında benzersizlik kontrolü
    const existing = await prisma.coupon.findMany({
      where: { code: { in: batchCodes } },
      select: { code: true },
    });
    const existingCodes = new Set(existing.map((c) => c.code));
    const uniqueCodes = batchCodes.filter((c) => !existingCodes.has(c));

    if (uniqueCodes.length > 0) {
      await prisma.coupon.createMany({
        data: uniqueCodes.map((code) => ({
          code,
          campaignId: params.campaignId ?? null,
          discountType: params.discountType,
          discountValue: params.discountValue,
          minOrderAmount: params.minOrderAmount ?? null,
          maxUses: params.maxUses ?? null,
          perCustomerLimit: params.perCustomerLimit ?? 1,
          expiresAt: params.expiresAt ?? null,
          isBulk: true,
        })),
      });
      codes.push(...uniqueCodes);
      created += uniqueCodes.length;
    }
  }

  return { created, codes };
}
