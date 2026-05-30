"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteAddressButton({ addressId }: { addressId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Bu adresi silmek istediğinizden emin misiniz?")) return;
    setLoading(true);
    await fetch(`/api/customer/addresses/${addressId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="text-xs text-red-500 font-semibold hover:underline disabled:opacity-50">
      {loading ? "Siliniyor..." : "Sil"}
    </button>
  );
}
