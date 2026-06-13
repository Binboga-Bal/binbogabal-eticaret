import { prisma } from "@/lib/prisma";
import QrAnalizClient from "./QrAnalizClient";

export const dynamic = "force-dynamic";

export default async function QrAnalizPage() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "qr_ocr_enabled" },
  });
  // Varsayılan: açık. Sadece "false" string'i kapatır.
  const ocrEnabled = setting?.value !== "false";

  return <QrAnalizClient ocrEnabled={ocrEnabled} />;
}
