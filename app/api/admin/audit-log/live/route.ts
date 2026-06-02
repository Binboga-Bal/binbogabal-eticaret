import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !session.isSuperAdmin) {
    return new Response("Yetkisiz", { status: 401 });
  }

  let lastId: string | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let idleCount = 0;

      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const interval = setInterval(async () => {
        idleCount++;

        // Close after 60 idle cycles (60 seconds)
        if (idleCount > 60) {
          clearInterval(interval);
          controller.close();
          return;
        }

        const where = lastId ? { id: { gt: lastId } } : {};
        const logs = await prisma.auditLog.findMany({
          where,
          take: 10,
          orderBy: { createdAt: "asc" },
          include: { admin: { select: { name: true, email: true } } },
        });

        if (logs.length > 0) {
          idleCount = 0;
          lastId = logs[logs.length - 1].id;
          send(logs);
        }
      }, 1000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
