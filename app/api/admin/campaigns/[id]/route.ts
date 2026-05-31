import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCampaign, updateCampaign, deleteCampaign } from "@/services/campaign.service";

function isAdmin(role?: string | null) {
  return role === "ADMIN" || role === "SUPERADMIN" || role === "EDITOR";
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(campaign);
}

export async function PUT(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const ip = req.headers.get("x-forwarded-for") ?? undefined;

  const { conditions, actions, segments, targets, ...rest } = body;

  // Alt ilişkileri önce sil, sonra yeniden oluştur
  await Promise.all([
    conditions !== undefined
      ? (async () => {
          await (await import("@/lib/prisma")).prisma.campaignCondition.deleteMany({ where: { campaignId: id } });
        })()
      : Promise.resolve(),
    actions !== undefined
      ? (async () => {
          await (await import("@/lib/prisma")).prisma.campaignAction.deleteMany({ where: { campaignId: id } });
        })()
      : Promise.resolve(),
    segments !== undefined
      ? (async () => {
          await (await import("@/lib/prisma")).prisma.campaignSegment.deleteMany({ where: { campaignId: id } });
        })()
      : Promise.resolve(),
    targets !== undefined
      ? (async () => {
          await (await import("@/lib/prisma")).prisma.campaignTarget.deleteMany({ where: { campaignId: id } });
        })()
      : Promise.resolve(),
  ]);

  const campaign = await updateCampaign(
    id,
    {
      ...rest,
      startsAt: rest.startsAt ? new Date(rest.startsAt) : undefined,
      endsAt: rest.endsAt ? new Date(rest.endsAt) : undefined,
      conditions: conditions?.length ? { create: conditions } : undefined,
      actions: actions?.length ? { create: actions } : undefined,
      segments: segments?.length ? { create: segments } : undefined,
      targets: targets?.length ? { create: targets } : undefined,
    },
    session.user.id!,
    ip,
  );

  return NextResponse.json(campaign);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await params;
  const ip = _req.headers.get("x-forwarded-for") ?? undefined;
  await deleteCampaign(id, session.user.id!, ip);
  return NextResponse.json({ ok: true });
}
