import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const adminSession = await getAdminSession();
  if (!adminSession) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { sessionId } = await params;
  const body = await req.json();
  const { status } = body as { status: "WAITING" | "ACTIVE" | "CLOSED" };

  const updated = await prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      status,
      ...(status === "CLOSED" ? { closedAt: new Date() } : {}),
    },
  });

  return NextResponse.json(updated);
}
