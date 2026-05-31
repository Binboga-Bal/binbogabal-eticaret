import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listCampaigns, createCampaign } from "@/services/campaign.service";
import type { CampaignStatus, CampaignType } from "@prisma/client";

function isAdmin(role?: string | null) {
  return role === "ADMIN" || role === "SUPERADMIN" || role === "EDITOR";
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const result = await listCampaigns({
    status: (searchParams.get("status") as CampaignStatus) || undefined,
    type: (searchParams.get("type") as CampaignType) || undefined,
    search: searchParams.get("search") || undefined,
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 20),
  });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();
  const ip = req.headers.get("x-forwarded-for") ?? undefined;

  const { conditions, actions, segments, targets, ...rest } = body;

  const campaign = await createCampaign(
    {
      ...rest,
      createdBy: session.user.id!,
      startsAt: new Date(rest.startsAt),
      endsAt: rest.endsAt ? new Date(rest.endsAt) : undefined,
      conditions: conditions?.length
        ? { create: conditions }
        : undefined,
      actions: actions?.length
        ? { create: actions }
        : undefined,
      segments: segments?.length
        ? { create: segments }
        : undefined,
      targets: targets?.length
        ? { create: targets }
        : undefined,
    },
    session.user.id!,
    ip,
  );

  return NextResponse.json(campaign, { status: 201 });
}
