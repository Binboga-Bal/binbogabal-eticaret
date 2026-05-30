"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RemoveFavoriteButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handle() {
    setLoading(true);
    await fetch(`/api/customer/favorites/${productId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={handle} disabled={loading} className="mt-3 text-xs text-red-500 hover:underline disabled:opacity-50">
      {loading ? "Kaldırılıyor..." : "Favorilerden Kaldır"}
    </button>
  );
}
