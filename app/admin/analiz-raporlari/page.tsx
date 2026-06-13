export const dynamic = "force-dynamic";

import Link from "next/link";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { BatchListClient } from "@/components/admin/BatchListClient";
import { Plus } from "lucide-react";
import QRCode from "qrcode";

export const metadata = { title: "Analiz Raporları | Admin" };

export default async function AdminBatchesPage() {
  await requirePermission("products", "view");

  const [batches, appUrl] = await Promise.all([
    prisma.honeyBatch.findMany({ orderBy: { createdAt: "desc" } }),
    Promise.resolve(process.env.NEXT_PUBLIC_APP_URL ?? "https://binbogabal.com"),
  ]);

  const qrUrl = `${appUrl}/qr-analiz`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 200,
    margin: 2,
    color: { dark: "#C57930", light: "#FFFFFF" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Analiz Raporları</h1>
        <Link
          href="/admin/analiz-raporlari/yeni"
          className="flex items-center gap-2 bg-honey text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-honey-dark transition-colors"
        >
          <Plus size={16} />
          Yeni Parti
        </Link>
      </div>

      {/* QR Kod Kartı */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR Kod" className="w-32 h-32 rounded-xl border border-gray-200" />
          <div className="flex-1">
            <h2 className="font-bold text-gray-800 mb-1">Etiket QR Kodu</h2>
            <p className="text-sm text-gray-500 mb-3">
              Bu QR kodu tüm kavanoz etiketlerine basın. Müşteri okuttuğunda analiz sayfasına ulaşır.
            </p>
            <div className="flex flex-wrap gap-2">
              <code className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-lg font-mono">
                {qrUrl}
              </code>
              <a
                href={qrDataUrl}
                download="binboga-qr-analiz.png"
                className="text-xs bg-honey text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-honey-dark transition-colors"
              >
                PNG İndir
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Liste */}
      <BatchListClient initialBatches={batches} />
    </div>
  );
}
