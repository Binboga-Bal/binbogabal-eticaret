import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resumeCampaign } from "@/services/campaign.service";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await params;
  const ip = _req.headers.get("x-forwarded-for") ?? undefined;
  const campaign = await resumeCampaign(id, session.user.id!, ip);
  return NextResponse.json(campaign);
}
