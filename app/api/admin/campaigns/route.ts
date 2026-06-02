import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { listCampaigns, createCampaign } from "@/services/campaign.service";
import type { CampaignStatus, CampaignType } from "@prisma/client";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "campaigns", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

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
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "campaigns", "create")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const body = await req.json();
  const ip = req.headers.get("x-forwarded-for") ?? undefined;

  const { conditions, actions, segments, targets, ...rest } = body;

  const campaign = await createCampaign(
    {
      ...rest,
      createdBy: session.adminId,
      startsAt: new Date(rest.startsAt),
      endsAt: rest.endsAt ? new Date(rest.endsAt) : undefined,
      conditions: conditions?.length ? { create: conditions } : undefined,
      actions: actions?.length ? { create: actions } : undefined,
      segments: segments?.length ? { create: segments } : undefined,
      targets: targets?.length ? { create: targets } : undefined,
    },
    session.adminId,
    ip,
  );

  return NextResponse.json(campaign, { status: 201 });
}
