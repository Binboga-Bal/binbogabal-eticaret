import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ batchNumber: string }> },
) {
  const { batchNumber } = await params;
  const { searchParams } = new URL(req.url);
  const dolum = searchParams.get("dolum"); // YYYY-MM-DD

  const where: Parameters<typeof prisma.honeyBatch.findMany>[0]["where"] = {
    batchNumber: decodeURIComponent(batchNumber),
    isActive: true,
    ...(dolum
      ? {
          productionDate: {
            gte: new Date(`${dolum}T00:00:00.000Z`),
            lt: new Date(`${dolum}T23:59:59.999Z`),
          },
        }
      : {}),
  };

  const select = {
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
  };

  const batches = await prisma.honeyBatch.findMany({ where, select });

  if (batches.length === 0) {
    return NextResponse.json({ error: "Parti bulunamadı" }, { status: 404 });
  }

  if (batches.length > 1) {
    // Birden fazla sonuç — dolum tarihi gerekiyor
    return NextResponse.json(
      { error: "multiple", message: "Bu parti numarasına ait birden fazla kayıt var. Dolum tarihini de girin." },
      { status: 409 },
    );
  }

  return NextResponse.json(batches[0]);
}
