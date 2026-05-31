import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await params;
  const { variantId } = await req.json();

  await prisma.campaignABTest.updateMany({
    where: { campaignId: id },
    data: { isWinner: false },
  });
  const winner = await prisma.campaignABTest.update({
    where: { id: variantId },
    data: { isWinner: true },
  });

  return NextResponse.json(winner);
}
