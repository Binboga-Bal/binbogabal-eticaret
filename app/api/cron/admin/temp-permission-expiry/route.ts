import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidatePermissionCache } from "@/lib/rbac/cache";
import { sendAdminMail } from "@/lib/mail/admin-mail.service";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const expired = await prisma.temporaryPermission.findMany({
    where: { isActive: true, validUntil: { lt: new Date() } },
    include: { user: true, permission: true },
  });

  for (const tp of expired) {
    await prisma.temporaryPermission.update({ where: { id: tp.id }, data: { isActive: false } });
    invalidatePermissionCache(tp.userId);

    await sendAdminMail("temp-permission-expired", tp.user.email, {
      name: tp.user.name,
      permission: `${tp.permission.module}:${tp.permission.action}`,
    });
  }

  return NextResponse.json({ processed: expired.length });
}
