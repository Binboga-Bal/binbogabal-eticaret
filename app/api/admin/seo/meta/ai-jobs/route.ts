import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const stream = searchParams.get("stream") === "true";

  if (stream) {
    // SSE stream — kuyruğu canlı olarak izle
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        let active = true;
        const interval = setInterval(async () => {
          if (!active) return;
          const [pending, running, completed, failed] = await Promise.all([
            prisma.aiSeoJob.count({ where: { status: "PENDING" } }),
            prisma.aiSeoJob.count({ where: { status: "RUNNING" } }),
            prisma.aiSeoJob.count({ where: { status: "COMPLETED" } }),
            prisma.aiSeoJob.count({ where: { status: "FAILED" } }),
          ]);
          sendEvent({ pending, running, completed, failed });

          if (pending === 0 && running === 0) {
            clearInterval(interval);
            active = false;
            controller.close();
          }
        }, 2000);

        // 5 dakika sonra otomatik kapat
        setTimeout(() => {
          clearInterval(interval);
          active = false;
          try { controller.close(); } catch { /* already closed */ }
        }, 5 * 60 * 1000);
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  const where = { ...(status ? { status } : {}) };
  const [jobs, counts] = await Promise.all([
    prisma.aiSeoJob.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.aiSeoJob.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const statusCounts = Object.fromEntries(counts.map((c) => [c.status, c._count]));
  return NextResponse.json({ jobs, statusCounts });
}
