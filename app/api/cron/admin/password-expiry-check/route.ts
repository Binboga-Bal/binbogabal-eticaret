import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAdminMail } from "@/lib/mail/admin-mail.service";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const policy = await prisma.passwordPolicy.findFirst();
  if (!policy?.expiryDays) return NextResponse.json({ skipped: true });

  const warningDate = new Date(Date.now() + 7 * 86400 * 1000);
  const expiryThreshold = new Date(Date.now() - (policy.expiryDays - 7) * 86400 * 1000);

  const admins = await prisma.adminUser.findMany({
    where: {
      status: "ACTIVE",
      passwordChangedAt: { lt: expiryThreshold, not: null },
    },
  });

  for (const admin of admins) {
    if (!admin.passwordChangedAt) continue;
    const expiresAt = new Date(admin.passwordChangedAt.getTime() + policy.expiryDays * 86400 * 1000);
    const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / 86400000);
    if (daysLeft > 0 && daysLeft <= 7) {
      await sendAdminMail("password-expiry-warning", admin.email, { name: admin.name, daysLeft });
    }
  }

  return NextResponse.json({ processed: admins.length });
}
