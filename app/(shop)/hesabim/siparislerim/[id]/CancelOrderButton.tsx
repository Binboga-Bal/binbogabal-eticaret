"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleCancel() {
    if (!confirm("Bu siparişi iptal etmek istediğinizden emin misiniz?")) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/customer/orders/${orderId}/cancel`, { method: "POST" });
    setLoading(false);
    if (!res.ok) { setError("İptal işlemi başarısız"); return; }
    router.refresh();
  }

  return (
    <div>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <button onClick={handleCancel} disabled={loading}
        className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        {loading ? "İptal ediliyor..." : "Siparişi İptal Et"}
      </button>
    </div>
  );
}
