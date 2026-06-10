import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: Ziyaretçi kendi oturumunu kapatır (hareketsizlik vb.)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const body = await req.json();
  const { status, visitorId } = body as { status: string; visitorId: string };

  if (status !== "CLOSED" || !visitorId) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, visitorId },
  });

  if (!session) {
    return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 404 });
  }

  if (session.status === "CLOSED") {
    return NextResponse.json(session);
  }

  const updated = await prisma.chatSession.update({
    where: { id: sessionId },
    data: { status: "CLOSED", closedAt: new Date() },
  });

  return NextResponse.json(updated);
}
