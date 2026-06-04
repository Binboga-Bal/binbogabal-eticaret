import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function authCheck(req: Request) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!authCheck(req)) return new Response("Unauthorized", { status: 401 });

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const deleted = await prisma.llmBotAccess.deleteMany({
    where: { accessedAt: { lt: ninetyDaysAgo } },
  });

  return NextResponse.json({ ok: true, deleted: deleted.count });
}
