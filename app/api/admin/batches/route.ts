import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit/logger";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "products", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const batches = await prisma.honeyBatch.findMany({
    where: q
      ? {
          OR: [
            { batchNumber: { contains: q, mode: "insensitive" } },
            { productName: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(batches);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "products", "create")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const body = await req.json();
  const {
    batchNumber, productName, productionDate, analysisDate, expiryDate,
    moistureContent, hmfValue, diastaseActivity, electricalConductivity,
    sucroseContent, ph, floraItems, floraNotes, laboratoryName, isActive,
  } = body;

  if (!batchNumber || !productName || !productionDate || !analysisDate || !expiryDate) {
    return NextResponse.json({ error: "Zorunlu alanlar eksik" }, { status: 400 });
  }

  const existing = await prisma.honeyBatch.findUnique({ where: { batchNumber } });
  if (existing) return NextResponse.json({ error: "Bu parti numarası zaten kayıtlı" }, { status: 400 });

  const batch = await prisma.honeyBatch.create({
    data: {
      batchNumber,
      productName,
      productionDate: new Date(productionDate),
      analysisDate: new Date(analysisDate),
      expiryDate: new Date(expiryDate),
      moistureContent: moistureContent ? Number(moistureContent) : null,
      hmfValue: hmfValue ? Number(hmfValue) : null,
      diastaseActivity: diastaseActivity ? Number(diastaseActivity) : null,
      electricalConductivity: electricalConductivity ? Number(electricalConductivity) : null,
      sucroseContent: sucroseContent ? Number(sucroseContent) : null,
      ph: ph ? Number(ph) : null,
      floraItems: floraItems ?? [],
      floraNotes: floraNotes || null,
      laboratoryName: laboratoryName || null,
      isActive: isActive ?? true,
    },
  });

  await logAction({
    adminId: session.adminId,
    action: "create",
    module: "batches",
    targetId: batch.id,
    targetLabel: batch.batchNumber,
    newData: { batchNumber: batch.batchNumber, productName: batch.productName },
    req,
  });

  return NextResponse.json(batch);
}
