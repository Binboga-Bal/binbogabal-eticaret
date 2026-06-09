import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Yeni mesajları + session durumunu getir (polling). ?after=ISO_DATE
export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const { searchParams } = new URL(req.url);
  const after = searchParams.get("after");

  const [session, messages] = await Promise.all([
    prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { status: true },
    }),
    prisma.chatMessage.findMany({
      where: {
        sessionId,
        ...(after ? { createdAt: { gt: new Date(after) } } : {}),
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return NextResponse.json({ messages, sessionStatus: session?.status ?? "CLOSED" });
}

// POST: Mesaj gönder (ziyaretçi)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const body = await req.json();
  const { content, visitorId, botResponse } = body as {
    content: string;
    visitorId: string;
    botResponse?: string;
  };

  if (!content?.trim() || !visitorId) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, visitorId },
  });

  if (!session) {
    return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 404 });
  }

  const created: object[] = [];

  const userMsg = await prisma.chatMessage.create({
    data: {
      sessionId,
      senderType: "VISITOR",
      content: content.trim(),
    },
  });
  created.push(userMsg);

  if (botResponse) {
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { status: "ACTIVE" },
    });

    const botMsg = await prisma.chatMessage.create({
      data: {
        sessionId,
        senderType: "BOT",
        senderName: "Binboğa Destek",
        content: botResponse,
        isRead: false,
      },
    });
    created.push(botMsg);
  } else if (session.status === "WAITING") {
    // Yeni kullanıcı mesajı — adminlere bildir (status zaten WAITING)
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });
  }

  return NextResponse.json(created);
}
