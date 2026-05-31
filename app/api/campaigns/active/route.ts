import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: "ACTIVE",
      startsAt: { lte: new Date() },
      OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      type: true,
      imageUrl: true,
      startsAt: true,
      endsAt: true,
      displays: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { priority: "desc" },
  });

  return NextResponse.json(campaigns);
}
