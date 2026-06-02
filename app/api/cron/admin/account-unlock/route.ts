import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const result = await prisma.adminUser.updateMany({
    where: { status: "LOCKED", lockedUntil: { lt: new Date() } },
    data: { status: "ACTIVE", failedLoginCount: 0, lockedUntil: null },
  });

  return NextResponse.json({ unlocked: result.count });
}
