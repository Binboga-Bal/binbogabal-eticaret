import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ChatQuickReplyCategory } from "@prisma/client";

// GET /api/chat/quick-replies?type=YENI_MUSTERI|MEVCUT_MUSTERI
// GENEL kategorisi her zaman döner; type varsa o kategori de eklenir.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as ChatQuickReplyCategory | null;

  const validTypes: ChatQuickReplyCategory[] = ["YENI_MUSTERI", "MEVCUT_MUSTERI"];
  const categories: ChatQuickReplyCategory[] =
    type && validTypes.includes(type)
      ? ["GENEL", type]
      : ["GENEL"];

  const replies = await prisma.chatQuickReply.findMany({
    where: { isActive: true, category: { in: categories } },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  return NextResponse.json(replies);
}
