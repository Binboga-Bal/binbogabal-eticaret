"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Eye } from "lucide-react";
import { HoneyBatch } from "@prisma/client";

type Props = { initialBatches: HoneyBatch[] };

function fmt(d: Date | string) {
  return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function BatchListClient({ initialBatches }: Props) {
  const router = useRouter();
  const [batches, setBatches] = useState(initialBatches);
  const [q, setQ] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = q
    ? batches.filter(
        (b) =>
          b.batchNumber.toLowerCase().includes(q.toLowerCase()) ||
          b.productName.toLowerCase().includes(q.toLowerCase()),
      )
    : batches;

  async function handleDelete(id: string, batchNumber: string) {
    if (!confirm(`"${batchNumber}" partisini silmek istediğinizden emin misiniz?`)) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/batches/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBatches((prev) => prev.filter((b) => b.id !== id));
    } else {
      alert("Silme işlemi başarısız oldu.");
    }
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      <div className="px-5 py-4 border-b flex items-center justify-between gap-4">
        <span className="font-bold text-gray-800">Partiler ({batches.length})</span>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Parti no. veya ürün ara..."
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-honey"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-5 py-3 text-left font-medium">Parti No.</th>
              <th className="px-5 py-3 text-left font-medium">Ürün</th>
              <th className="px-5 py-3 text-left font-medium">Dolum Tarihi</th>
              <th className="px-5 py-3 text-left font-medium">TETT</th>
              <th className="px-5 py-3 text-left font-medium">Durum</th>
              <th className="px-5 py-3 text-right font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-mono font-semibold text-gray-900">{b.batchNumber}</td>
                <td className="px-5 py-3 text-gray-700">{b.productName}</td>
                <td className="px-5 py-3 text-gray-500">{fmt(b.productionDate)}</td>
                <td className="px-5 py-3 text-gray-500">{fmt(b.expiryDate)}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      b.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {b.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <a
                      href={`/qr-analiz?parti=${encodeURIComponent(b.batchNumber)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-gray-400 hover:text-honey-dark hover:bg-gray-100 rounded-lg transition-colors"
                      title="Müşteri görünümü"
                    >
                      <Eye size={15} />
                    </a>
                    <Link
                      href={`/admin/analiz-raporlari/${b.id}/duzenle`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Düzenle"
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      onClick={() => handleDelete(b.id, b.batchNumber)}
                      disabled={deleting === b.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Sil"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                  {q ? "Arama sonucu bulunamadı" : "Henüz analiz raporu eklenmemiş"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
