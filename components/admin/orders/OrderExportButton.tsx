"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Bekliyor",
  CONFIRMED: "Onaylandı",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal",
  REFUNDED: "İade Edildi",
  REFUND_REQUESTED: "İade Talep Edildi",
};

interface OrderRow {
  orderNumber: string;
  createdAt: string;
  total: number | string;
  status: string;
  paymentStatus: string;
  erpOrderCode: string | null;
  guestEmail: string | null;
  user: { name: string | null; email: string } | null;
}

function buildPrintHtml(orders: OrderRow[]): string {
  const now = new Date().toLocaleString("tr-TR");
  const rows = orders
    .map(
      (o) => `
    <tr>
      <td>${o.orderNumber}</td>
      <td>${new Date(o.createdAt).toLocaleString("tr-TR")}</td>
      <td>${o.user?.name ?? "Misafir"}</td>
      <td>${o.user?.email ?? o.guestEmail ?? ""}</td>
      <td class="num">${Number(o.total).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</td>
      <td>${STATUS_LABELS[o.status] ?? o.status}</td>
      <td>${o.erpOrderCode ?? "-"}</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Sipariş Raporu</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; padding: 24px; color: #1a1a1a; }
    h1 { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
    .meta { color: #666; font-size: 11px; margin-bottom: 16px; }
    .actions { margin-bottom: 16px; }
    button { padding: 8px 20px; background: #c57930; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; }
    button:hover { background: #a5621e; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f5f5f5; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #ddd; white-space: nowrap; }
    td { padding: 7px 10px; border-bottom: 1px solid #eee; vertical-align: middle; }
    td.num { text-align: right; font-weight: 600; }
    tr:last-child td { border-bottom: none; }
    @media print { .actions { display: none !important; } }
  </style>
</head>
<body>
  <h1>Sipariş Raporu</h1>
  <div class="meta">Oluşturulma: ${now} &nbsp;·&nbsp; Toplam: ${orders.length} sipariş</div>
  <div class="actions">
    <button onclick="window.print()">Yazdır / PDF Olarak Kaydet</button>
  </div>
  <table>
    <thead>
      <tr>
        <th>Sipariş No</th><th>Tarih</th><th>Müşteri</th>
        <th>E-posta</th><th>Tutar</th><th>Durum</th><th>ERP Kodu</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}

export function OrderExportButton() {
  const searchParams = useSearchParams();
  const [loadingXlsx, setLoadingXlsx] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  async function downloadXlsx() {
    setLoadingXlsx(true);
    try {
      const qs = searchParams.toString();
      const res = await fetch(`/api/admin/orders/export?${qs}&format=xlsx`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `siparisler-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoadingXlsx(false);
    }
  }

  async function openPdf() {
    setLoadingPdf(true);
    try {
      const qs = searchParams.toString();
      const res = await fetch(`/api/admin/orders/export?${qs}&format=json`);
      if (!res.ok) return;
      const orders: OrderRow[] = await res.json();
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write(buildPrintHtml(orders));
      win.document.close();
    } finally {
      setLoadingPdf(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={downloadXlsx} loading={loadingXlsx}>
        Excel İndir
      </Button>
      <Button variant="outline" size="sm" onClick={openPdf} loading={loadingPdf}>
        PDF İndir
      </Button>
    </div>
  );
}
