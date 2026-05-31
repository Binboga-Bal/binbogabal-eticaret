import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      displays: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      translations: true,
    },
  });
  if (!campaign) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(campaign);
}
