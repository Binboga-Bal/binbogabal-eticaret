import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit/logger";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "products", "edit")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const {
    batchNumber, productName, productionDate, analysisDate, expiryDate,
    moistureContent, hmfValue, diastaseActivity, electricalConductivity,
    sucroseContent, ph, floraItems, floraNotes, laboratoryName, isActive,
  } = body;

  const existing = await prisma.honeyBatch.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Parti bulunamadı" }, { status: 404 });

  const duplicate = await prisma.honeyBatch.findFirst({
    where: { batchNumber, NOT: { id } },
  });
  if (duplicate) return NextResponse.json({ error: "Bu parti numarası başka kayıtta kullanılıyor" }, { status: 400 });

  const batch = await prisma.honeyBatch.update({
    where: { id },
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
    action: "update",
    module: "batches",
    targetId: batch.id,
    targetLabel: batch.batchNumber,
    newData: { batchNumber: batch.batchNumber, productName: batch.productName },
    req,
  });

  return NextResponse.json(batch);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "products", "delete")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;

  const existing = await prisma.honeyBatch.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Parti bulunamadı" }, { status: 404 });

  await prisma.honeyBatch.delete({ where: { id } });

  await logAction({
    adminId: session.adminId,
    action: "delete",
    module: "batches",
    targetId: id,
    targetLabel: existing.batchNumber,
    req,
  });

  return NextResponse.json({ ok: true });
}
