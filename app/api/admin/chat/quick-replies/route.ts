import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const replies = await prisma.chatQuickReply.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(replies);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const { question, answer, order, category } = body as {
    question: string;
    answer: string;
    order?: number;
    category?: string;
  };

  if (!question?.trim() || !answer?.trim()) {
    return NextResponse.json({ error: "Soru ve cevap zorunlu" }, { status: 400 });
  }

  const reply = await prisma.chatQuickReply.create({
    data: {
      question: question.trim(),
      answer: answer.trim(),
      order: order ?? 0,
      category: (category as "GENEL" | "YENI_MUSTERI" | "MEVCUT_MUSTERI") ?? "GENEL",
    },
  });

  return NextResponse.json(reply);
}
