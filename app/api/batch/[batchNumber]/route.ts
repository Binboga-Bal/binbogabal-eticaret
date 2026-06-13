import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ batchNumber: string }> },
) {
  const { batchNumber } = await params;

  const batch = await prisma.honeyBatch.findUnique({
    where: { batchNumber: decodeURIComponent(batchNumber) },
    select: {
      id: true,
      batchNumber: true,
      productName: true,
      productionDate: true,
      analysisDate: true,
      expiryDate: true,
      moistureContent: true,
      hmfValue: true,
      diastaseActivity: true,
      electricalConductivity: true,
      sucroseContent: true,
      ph: true,
      floraItems: true,
      floraNotes: true,
      laboratoryName: true,
      isActive: true,
    },
  });

  if (!batch) return NextResponse.json({ error: "Parti bulunamadı" }, { status: 404 });
  if (!batch.isActive) return NextResponse.json({ error: "Bu parti aktif değil" }, { status: 404 });

  return NextResponse.json(batch);
}
