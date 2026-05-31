import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCampaignStats } from "@/services/campaign.service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN", "EDITOR"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await params;
  const stats = await getCampaignStats(id);
  if (!stats) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(stats);
}
